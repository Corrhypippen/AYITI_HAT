'use strict';

const env = require('../config/env');

const BASE_URL = env.PRINTFUL_BASE_URL;
const HEADERS = {
  'Authorization': `Bearer ${env.PRINTFUL_API_KEY}`,
  'Content-Type': 'application/json',
  'X-PF-Store-Type': 'manual_order_only', // avoids accidental synced-product confusion
};

/**
 * Generic Printful API helper.
 * Throws a structured error if the response is not 2xx.
 */
async function printfulRequest(method, path, body = null) {
  const opts = {
    method,
    headers: HEADERS,
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const json = await res.json();

  if (!res.ok) {
    const err = new Error(json?.error?.message || `Printful API error (${res.status})`);
    err.code = res.status;
    err.printfulError = json;
    throw err;
  }

  return json;
}

// ──────────────────────────────────────────────────────────────────────────────
// Products (Catalog / Sync Products)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all synced products from the Printful store.
 * Returns an array of sync product summaries.
 * @returns {Promise<Array>}
 */
async function getProducts() {
  const json = await printfulRequest('GET', '/store/products');
  return json.result || [];
}

/**
 * Fetch full details for a single synced product (including all variants + pricing).
 * @param {number} syncProductId
 * @returns {Promise<Object>}
 */
async function getProduct(syncProductId) {
  const json = await printfulRequest('GET', `/store/products/${syncProductId}`);
  return json.result || null;
}

/**
 * Fetch a single sync variant by its ID.
 * @param {number} syncVariantId
 * @returns {Promise<Object>}
 */
async function getSyncVariant(syncVariantId) {
  const json = await printfulRequest('GET', `/store/variants/${syncVariantId}`);
  return json.result?.sync_variant || null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Orders
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Create an order in Printful.
 * Sends the order but does NOT auto-confirm (confirm: false = draft mode).
 * We call confirmOrder() separately after capturing payment.
 *
 * @param {Object} params
 * @param {string} params.externalId       - Our DB order ID (for Printful's external_id)
 * @param {Object} params.shippingAddress  - Printful-formatted address object
 * @param {Array}  params.items            - [{ sync_variant_id, quantity }]
 * @returns {Promise<Object>} Printful order result
 */
async function createOrder(params) {
  const payload = {
    external_id: params.externalId,
    shipping:    'STANDARD',
    recipient: {
      name:         params.shippingAddress.name,
      email:        params.shippingAddress.email,
      address1:     params.shippingAddress.address1,
      address2:     params.shippingAddress.address2 || '',
      city:         params.shippingAddress.city,
      state_code:   params.shippingAddress.stateCode,
      country_code: params.shippingAddress.countryCode,
      zip:          params.shippingAddress.zip,
    },
    items: params.items.map((item) => {
      const lineItem = {
        variant_id:   item.variantId,
        quantity:     item.quantity,
        retail_price: item.retailPrice.toFixed(2),
      };
      if (item.files) lineItem.files = item.files;
      if (item.options) lineItem.options = item.options;
      return lineItem;
    }),
    // Don't confirm (charge Printful) until we've captured the customer's payment
    confirm: false,
  };

  const json = await printfulRequest('POST', '/orders', payload);
  return json.result;
}

/**
 * Confirm a Printful draft order (triggers production).
 * Call this AFTER successfully capturing payment.
 *
 * @param {number} printfulOrderId
 * @returns {Promise<Object>}
 */
async function confirmOrder(printfulOrderId) {
  const json = await printfulRequest('POST', `/orders/${printfulOrderId}/confirm`);
  return json.result;
}

/**
 * Cancel a Printful order (call if payment capture fails after order creation).
 *
 * @param {number} printfulOrderId
 * @returns {Promise<Object>}
 */
async function cancelOrder(printfulOrderId) {
  const json = await printfulRequest('DELETE', `/orders/${printfulOrderId}`);
  return json.result;
}

module.exports = {
  getProducts,
  getProduct,
  getSyncVariant,
  createOrder,
  confirmOrder,
  cancelOrder,
};
