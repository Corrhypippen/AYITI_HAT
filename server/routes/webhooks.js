'use strict';

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const env = require('../config/env');
const db = require('../db/orders');
const supabase = require('../db/supabase');
const { sendShipmentNotification } = require('../services/email');

// ──────────────────────────────────────────────────────────────────────────────
// HMAC Signature Verification
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Verifies the X-Printful-Signature header against our webhook secret.
 * Printful signs the raw request body with HMAC-SHA256.
 *
 * @param {Buffer|string} rawBody
 * @param {string} signature
 * @returns {boolean}
 */
function verifyPrintfulSignature(rawBody, signature) {
  if (!signature || !rawBody) return false;
  try {
    const expected = crypto
      .createHmac('sha256', env.PRINTFUL_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expected, 'hex');

    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(expBuf, sigBuf);
  } catch (_) {
    return false;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/printful-webhook
// ──────────────────────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  const signature = req.headers['x-printful-signature'];
  const rawBody = req.rawBody || (Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body)));

  // If a signature is provided, verify it
  if (signature && !verifyPrintfulSignature(rawBody, signature)) {
    console.warn('[webhook] Invalid Printful signature — request rejected');
    return res.status(200).json({ received: true, valid: false });
  }

  // Parse event payload
  let event;
  try {
    event = typeof req.body === 'object' && !Buffer.isBuffer(req.body)
      ? req.body
      : JSON.parse(rawBody.toString('utf8'));
  } catch (parseErr) {
    console.error('[webhook] Failed to parse Printful webhook body:', parseErr.message);
    return res.status(200).json({ received: true });
  }

  const eventType  = event.type;
  const eventData  = event.data || {};
  const order      = eventData.order || {};
  const externalId = order.external_id;
  const printfulId = order.id || null;

  console.log(`[webhook] Received event: ${eventType} | external_id: ${externalId} | printful_id: ${printfulId}`);

  // Acknowledge immediately to prevent Printful retries
  res.status(200).json({ received: true });

  // Audit log to webhook_events table in Supabase
  try {
    await supabase.from('webhook_events').insert({
      event_type:        eventType,
      printful_order_id: printfulId,
      external_id:       externalId || null,
      payload:           event,
      processed:         true,
    });
  } catch (logErr) {
    console.warn('[webhook] Failed to log webhook event to DB:', logErr.message);
  }

  if (!externalId) {
    console.warn(`[webhook] Event ${eventType} has no external_id — skipping order update`);
    return;
  }

  switch (eventType) {
    case 'package_shipped': {
      const shipment = eventData.shipment || {};
      const trackingNumber  = shipment.tracking_number || null;
      const trackingCarrier = shipment.carrier || null;
      const trackingUrl     = shipment.tracking_url || null;

      try {
        const updatedOrder = await db.updateOrderStatus(externalId, 'shipped', {
          tracking_number:  trackingNumber,
          tracking_carrier: trackingCarrier,
          shipped_at:       new Date().toISOString(),
        });

        if (updatedOrder?.customer_email) {
          await sendShipmentNotification({
            to:            updatedOrder.customer_email,
            customerName:  updatedOrder.customer_name,
            externalId,
            trackingNumber,
            carrier:       trackingCarrier,
            trackingUrl,
            lineItems:     updatedOrder.line_items || [],
          });
          console.log(`[webhook] Shipment email sent to ${updatedOrder.customer_email}`);
        }
      } catch (err) {
        console.error(`[webhook] package_shipped handler error for ${externalId}:`, err.message);
      }
      break;
    }

    case 'order_failed': {
      try {
        await db.updateOrderStatus(externalId, 'action_required', {
          printful_error: {
            event:   'order_failed',
            reason:  order.error || 'Printful reported order failure',
            raw:     eventData,
          },
        });
        console.log(`[webhook] Order marked action_required (order_failed): ${externalId}`);
      } catch (err) {
        console.error(`[webhook] order_failed handler error for ${externalId}:`, err.message);
      }
      break;
    }

    case 'order_canceled': {
      try {
        await db.updateOrderStatus(externalId, 'canceled', {
          printful_error: {
            event: 'order_canceled',
            raw:   eventData,
          },
        });
        console.log(`[webhook] Order marked canceled: ${externalId}`);
      } catch (err) {
        console.error(`[webhook] order_canceled handler error for ${externalId}:`, err.message);
      }
      break;
    }

    default:
      console.log(`[webhook] Informational event received: ${eventType}`);
  }
});

module.exports = router;
