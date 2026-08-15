'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const { resolveItemConfig, resolveVariantId } = require('../config/printfulVariants');
const db = require('../db/orders');
const supabase = require('../db/supabase');
const printful = require('../services/printful');
const stripeService = require('../services/stripe');
const paypalService = require('../services/paypal');
const { sendOrderConfirmation } = require('../services/email');

// ──────────────────────────────────────────────────────────────────────────────
// Request Validation
// ──────────────────────────────────────────────────────────────────────────────

function validateCheckoutBody(body) {
  const errors = [];

  // Default to stripe
  if (!body.paymentMethod) {
    body.paymentMethod = 'stripe';
  }

  if (body.paymentMethod !== 'stripe') {
    errors.push('paymentMethod must be "stripe"');
  }

  if (!body.paymentMethodId) {
    errors.push('paymentMethodId is required for Stripe payments');
  }

  if (!Array.isArray(body.cart) || body.cart.length === 0) {
    errors.push('cart must be a non-empty array');
  } else {
    body.cart.forEach((item, i) => {
      if (!item.sku) errors.push(`cart[${i}].sku is required`);
      if (!item.quantity || item.quantity < 1) errors.push(`cart[${i}].quantity must be >= 1`);
      if (!item.price || item.price <= 0) errors.push(`cart[${i}].price must be > 0`);
    });
  }

  const s = body.shipping || {};
  if (!s.name)        errors.push('shipping.name is required');
  if (!s.email)       errors.push('shipping.email is required');
  if (!s.address1)    errors.push('shipping.address1 is required');
  if (!s.city)        errors.push('shipping.city is required');
  if (!s.countryCode) errors.push('shipping.countryCode is required');
  if (!s.zip)         errors.push('shipping.zip is required');

  return errors;
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/checkout
// ──────────────────────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  const body = req.body;

  // ── 1. Validate ─────────────────────────────────────────────────────────────
  const errors = validateCheckoutBody(body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // ── 2. Resolve SKUs ─────────────────────────────────────────────────────────
  let resolvedItems;
  try {
    resolvedItems = body.cart.map((item) => {
      const itemConfig = resolveItemConfig(item.sku);
      return {
        variantId:   itemConfig.variant_id,
        files:       itemConfig.files,
        options:     itemConfig.options,
        sku:         item.sku,
        name:        item.name || item.sku,
        colorway:    item.colorway || '',
        quantity:    item.quantity,
        price:       item.price,
        retailPrice: item.price,
      };
    });
  } catch (skuErr) {
    return res.status(400).json({
      error: 'Product configuration error',
      message: skuErr.message,
    });
  }

  const itemsSubtotal = body.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost = itemsSubtotal >= 75 ? 0 : 4.99;
  const totalAmount = parseFloat((itemsSubtotal + shippingCost).toFixed(2));

  // Printful requires external_id <= 32 characters
  const externalId = uuidv4().replace(/-/g, '');

  // ── 3. Create DB Record ──────────────────────────────────────────────────────
  let orderRecord;
  try {
    orderRecord = await db.createOrder({
      externalId,
      paymentMethod:   body.paymentMethod,
      customerEmail:   body.shipping.email,
      customerName:    body.shipping.name,
      shippingAddress: body.shipping,
      lineItems:       resolvedItems,
      totalAmount,
    });
  } catch (dbErr) {
    console.error('[checkout] DB createOrder failed:', dbErr.message);
    return res.status(500).json({ error: 'Failed to create order record. Please try again.' });
  }

  // ── 4. Authorize Payment ─────────────────────────────────────────────────────
  // ── 4. Authorize Payment (Stripe) ──────────────────────────────────────────
  let paymentIntentId = null;

  try {
    const amountCents = Math.round(totalAmount * 100);
    const auth = await stripeService.authorizePayment(
      amountCents,
      'usd',
      body.paymentMethodId,
      body.shipping.email
    );
    paymentIntentId = auth.paymentIntentId;

    await db.updateOrderStatus(externalId, 'processing', {
      payment_intent: paymentIntentId,
    });
  } catch (authErr) {
    console.error('[checkout] Payment authorization failed:', authErr.message);
    await db.updateOrderStatus(externalId, 'action_required', {
      printful_error: { stage: 'payment_auth', message: authErr.message },
    });
    return res.status(402).json({
      error: 'Payment authorization failed',
      message: authErr.message,
    });
  }

  // ── 5. Create Printful Order (Draft) ─────────────────────────────────────────
  let printfulOrder;
  try {
    printfulOrder = await printful.createOrder({
      externalId,
      shippingAddress: body.shipping,
      items: resolvedItems,
    });
  } catch (printfulErr) {
    console.error('[checkout] Printful order creation failed:', printfulErr.message);

    // Void the payment — customer is NOT charged
    try {
      if (paymentIntentId) {
        await stripeService.voidPayment(paymentIntentId);
      }
    } catch (voidErr) {
      console.error('[checkout] Failed to void payment after Printful error:', voidErr.message);
    }

    await db.updateOrderStatus(externalId, 'action_required', {
      printful_error: printfulErr.printfulError || { message: printfulErr.message },
    });

    return res.status(422).json({
      error: 'Order could not be placed with our fulfillment partner.',
      message: printfulErr.message,
      userMessage:
        'We were unable to process your order (it may be out of stock or have an invalid address). ' +
        'Your card has NOT been charged. Please try again or contact support.',
    });
  }

  // ── 6. Capture Payment ───────────────────────────────────────────────────────
  try {
    await stripeService.capturePayment(paymentIntentId);
  } catch (captureErr) {
    console.error('[checkout] Payment capture failed:', captureErr.message);

    // Try to cancel the Printful draft order since payment failed
    try {
      await printful.cancelOrder(printfulOrder.id);
    } catch (_) {}

    await db.updateOrderStatus(externalId, 'action_required', {
      printful_error: { stage: 'payment_capture', message: captureErr.message },
    });

    return res.status(500).json({
      error: 'Payment capture failed after order was accepted.',
      message: captureErr.message,
      userMessage: 'Your payment could not be finalized. Your card has NOT been charged. Please contact support.',
    });
  }

  // ── 7. Confirm Printful Order (Trigger Production) ───────────────────────────
  try {
    await printful.confirmOrder(printfulOrder.id);
  } catch (confirmErr) {
    // Non-fatal: payment already captured. Log and flag for manual review.
    console.error('[checkout] Printful order confirm failed (payment captured):', confirmErr.message);
    await db.updateOrderStatus(externalId, 'action_required', {
      printful_id:    printfulOrder.id,
      printful_error: { stage: 'printful_confirm', message: confirmErr.message },
    });
    // Still return success to the customer — order will be manually reviewed
  }

  // ── 8. Update DB to Confirmed ────────────────────────────────────────────────
  await db.updateOrderStatus(externalId, 'confirmed', {
    printful_id: printfulOrder.id,
  });

  // Update customer record in Supabase
  try {
    const { data: existingCust } = await supabase
      .from('customers')
      .select('id, total_orders, total_spent')
      .eq('email', body.shipping.email)
      .single();

    if (existingCust) {
      await supabase
        .from('customers')
        .update({
          full_name:                body.shipping.name,
          default_shipping_address: body.shipping,
          total_orders:             (existingCust.total_orders || 0) + 1,
          total_spent:              parseFloat(((existingCust.total_spent || 0) + totalAmount).toFixed(2)),
        })
        .eq('id', existingCust.id);
    } else {
      await supabase
        .from('customers')
        .insert({
          email:                    body.shipping.email,
          full_name:                body.shipping.name,
          default_shipping_address: body.shipping,
          total_orders:             1,
          total_spent:              totalAmount,
        });
    }
  } catch (custErr) {
    console.warn('[checkout] Failed to update customer record:', custErr.message);
  }

  // ── 9. Send Confirmation Email (non-blocking) ────────────────────────────────
  sendOrderConfirmation({
    to:          body.shipping.email,
    customerName: body.shipping.name,
    externalId,
    lineItems:   resolvedItems,
    totalAmount,
  }).catch((emailErr) => {
    console.error('[checkout] Confirmation email failed (non-fatal):', emailErr.message);
  });

  // ── 10. Return Success ───────────────────────────────────────────────────────
  console.log(`[checkout] Order confirmed: external_id=${externalId} printful_id=${printfulOrder.id}`);

  return res.status(200).json({
    success:    true,
    orderId:    externalId,
    printfulId: printfulOrder.id,
    message:    'Order placed successfully.',
  });
});

module.exports = router;
