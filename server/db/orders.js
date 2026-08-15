'use strict';

const supabase = require('./supabase');

/**
 * Create a new order record with status 'processing'.
 * Called immediately before the payment authorization attempt.
 *
 * @param {Object} data
 * @param {string} data.externalId       - UUID we generate (links our DB ↔ Printful)
 * @param {string} data.paymentMethod    - 'stripe' | 'paypal'
 * @param {string} data.customerEmail
 * @param {string} data.customerName
 * @param {Object} data.shippingAddress
 * @param {Array}  data.lineItems        - [{ sku, name, quantity, price, syncVariantId }]
 * @param {number} data.totalAmount
 * @returns {Promise<Object>} The inserted row
 */
async function createOrder(data) {
  const { data: row, error } = await supabase
    .from('orders')
    .insert({
      external_id:      data.externalId,
      payment_method:   data.paymentMethod,
      customer_email:   data.customerEmail,
      customer_name:    data.customerName,
      shipping_address: data.shippingAddress,
      line_items:       data.lineItems,
      total_amount:     data.totalAmount,
      status:           'processing',
    })
    .select()
    .single();

  if (error) throw new Error(`[DB] createOrder failed: ${error.message}`);
  return row;
}

/**
 * Update an order's status and optional extra fields.
 *
 * @param {string} externalId
 * @param {string} status  - 'processing' | 'confirmed' | 'shipped' | 'action_required' | 'canceled'
 * @param {Object} [extra] - Additional columns to update (e.g. printful_id, printful_error, payment_intent)
 * @returns {Promise<Object>} The updated row
 */
async function updateOrderStatus(externalId, status, extra = {}) {
  const { data: row, error } = await supabase
    .from('orders')
    .update({ status, ...extra })
    .eq('external_id', externalId)
    .select()
    .single();

  if (error) throw new Error(`[DB] updateOrderStatus failed for ${externalId}: ${error.message}`);
  return row;
}

/**
 * Fetch a single order by its external_id.
 *
 * @param {string} externalId
 * @returns {Promise<Object|null>}
 */
async function getOrderByExternalId(externalId) {
  const { data: row, error } = await supabase
    .from('orders')
    .select('*')
    .eq('external_id', externalId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`[DB] getOrderByExternalId failed: ${error.message}`);
  }
  return row || null;
}

/**
 * Fetch all orders with status 'action_required' (for admin review).
 *
 * @returns {Promise<Array>}
 */
async function getActionRequiredOrders() {
  const { data: rows, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'action_required')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`[DB] getActionRequiredOrders failed: ${error.message}`);
  return rows || [];
}

module.exports = {
  createOrder,
  updateOrderStatus,
  getOrderByExternalId,
  getActionRequiredOrders,
};
