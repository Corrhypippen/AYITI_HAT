'use strict';

const Stripe = require('stripe');
const env = require('../config/env');

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

/**
 * Create a PaymentIntent with capture_method: 'manual'.
 * This AUTHORIZES the card but does NOT charge it yet.
 *
 * @param {number} amountCents  - Amount in the smallest currency unit (e.g. 3000 = $30.00)
 * @param {string} currency     - ISO 4217 currency code (default 'usd')
 * @param {string} paymentMethodId - Stripe PaymentMethod ID from the frontend (pm_xxx)
 * @param {string} customerEmail
 * @returns {Promise<{ paymentIntentId: string, clientSecret: string, status: string }>}
 */
async function authorizePayment(amountCents, currency = 'usd', paymentMethodId, customerEmail) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount:             amountCents,
    currency,
    payment_method:     paymentMethodId,
    capture_method:     'manual',     // ← authorization only, not capture
    confirm:            true,         // immediately attempt authorization
    receipt_email:      customerEmail,
    description:        'AYITI Heritage — Hat Order',
    metadata: {
      store: 'ayiti_heritage',
    },
    automatic_payment_methods: {
      enabled:          true,
      allow_redirects:  'never',      // no 3DS redirect for server-side confirms
    },
  });

  if (paymentIntent.status !== 'requires_capture') {
    throw new Error(
      `Stripe authorization did not reach requires_capture status. ` +
      `Current status: ${paymentIntent.status}. ` +
      `This may indicate a card decline or 3DS requirement.`
    );
  }

  return {
    paymentIntentId: paymentIntent.id,
    clientSecret:    paymentIntent.client_secret,
    status:          paymentIntent.status,
  };
}

/**
 * Capture a previously authorized PaymentIntent.
 * Call this AFTER Printful has successfully accepted the order.
 *
 * @param {string} paymentIntentId
 * @returns {Promise<{ status: string }>}
 */
async function capturePayment(paymentIntentId) {
  const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
  return { status: paymentIntent.status };
}

/**
 * Void (cancel) a previously authorized PaymentIntent.
 * Call this if Printful rejects the order — the customer is NOT charged.
 *
 * @param {string} paymentIntentId
 * @returns {Promise<{ status: string }>}
 */
async function voidPayment(paymentIntentId) {
  const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
  return { status: paymentIntent.status };
}

module.exports = {
  authorizePayment,
  capturePayment,
  voidPayment,
};
