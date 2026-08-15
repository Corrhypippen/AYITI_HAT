'use strict';

const env = require('../config/env');

const PAYPAL_BASE =
  env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// ──────────────────────────────────────────────────────────────────────────────
// Token management (simple in-memory cache)
// ──────────────────────────────────────────────────────────────────────────────
let _tokenCache = null;
let _tokenExpiry = 0;

/**
 * Fetch a PayPal OAuth2 access token (cached until expiry).
 * @returns {Promise<string>}
 */
async function getAccessToken() {
  if (_tokenCache && Date.now() < _tokenExpiry) return _tokenCache;

  const credentials = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal token fetch failed: ${err}`);
  }

  const json = await res.json();
  _tokenCache = json.access_token;
  _tokenExpiry = Date.now() + (json.expires_in - 60) * 1000; // expire 60s early
  return _tokenCache;
}

/**
 * Generic PayPal API helper.
 */
async function paypalRequest(method, path, body = null) {
  const token = await getAccessToken();
  const opts = {
    method,
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer:         'return=representation',
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${PAYPAL_BASE}${path}`, opts);
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const err = new Error(json?.message || `PayPal API error (${res.status})`);
    err.code = res.status;
    err.paypalError = json;
    throw err;
  }
  return json;
}

// ──────────────────────────────────────────────────────────────────────────────
// Authorize → Capture → Void flow
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Create a PayPal Order with AUTHORIZE intent.
 * This HOLDS the funds but does NOT charge the customer yet.
 *
 * @param {number} amountUSD  - Decimal dollar amount (e.g. 30.00)
 * @param {string} currency   - ISO 4217 currency (default 'USD')
 * @returns {Promise<{ orderId: string, approveUrl: string }>}
 */
async function createOrder(amountUSD, currency = 'USD') {
  const order = await paypalRequest('POST', '/v2/checkout/orders', {
    intent: 'AUTHORIZE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value:         amountUSD.toFixed(2),
        },
        description: 'AYITI Heritage — Hat Order',
      },
    ],
    application_context: {
      brand_name:          'AYITI Heritage',
      landing_page:        'NO_PREFERENCE',
      user_action:         'PAY_NOW',
      return_url:          `${env.FRONTEND_URL}/checkout/success`,
      cancel_url:          `${env.FRONTEND_URL}/checkout/cancel`,
    },
  });

  const approveUrl = order.links?.find((l) => l.rel === 'approve')?.href || '';
  return { orderId: order.id, approveUrl };
}

/**
 * Authorize a PayPal order that has been approved by the buyer.
 * Call this after the buyer returns from the PayPal approval flow.
 *
 * @param {string} paypalOrderId - Returned from createOrder()
 * @returns {Promise<{ authorizationId: string, status: string }>}
 */
async function authorizeOrder(paypalOrderId) {
  const result = await paypalRequest(
    'POST',
    `/v2/checkout/orders/${paypalOrderId}/authorize`
  );

  const authorizationId =
    result.purchase_units?.[0]?.payments?.authorizations?.[0]?.id;

  if (!authorizationId) {
    throw new Error('PayPal authorization did not return an authorization ID.');
  }

  return { authorizationId, status: result.status };
}

/**
 * Capture a PayPal authorization.
 * Call this AFTER Printful has accepted the order.
 *
 * @param {string} authorizationId - From authorizeOrder()
 * @returns {Promise<{ captureId: string, status: string }>}
 */
async function captureAuthorization(authorizationId) {
  const result = await paypalRequest(
    'POST',
    `/v2/payments/authorizations/${authorizationId}/capture`,
    { final_capture: true }
  );

  return { captureId: result.id, status: result.status };
}

/**
 * Void a PayPal authorization.
 * Call this if Printful rejects the order — the customer is NOT charged.
 *
 * @param {string} authorizationId - From authorizeOrder()
 * @returns {Promise<void>}
 */
async function voidAuthorization(authorizationId) {
  await paypalRequest(
    'POST',
    `/v2/payments/authorizations/${authorizationId}/void`
  );
}

module.exports = {
  createOrder,
  authorizeOrder,
  captureAuthorization,
  voidAuthorization,
};
