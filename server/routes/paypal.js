'use strict';

const express = require('express');
const router = express.Router();
const paypalService = require('../services/paypal');

/**
 * POST /api/paypal/create-order
 * Creates a PayPal order with AUTHORIZE intent.
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const { orderId, approveUrl } = await paypalService.createOrder(amount);
    return res.json({ orderId, approveUrl });
  } catch (err) {
    console.error('[/api/paypal/create-order] Error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to create PayPal order' });
  }
});

/**
 * POST /api/paypal/authorize
 * Authorizes a buyer-approved PayPal order and retrieves authorizationId.
 */
router.post('/authorize', async (req, res) => {
  try {
    const { paypalOrderId } = req.body;
    if (!paypalOrderId) {
      return res.status(400).json({ error: 'paypalOrderId is required' });
    }

    const { authorizationId, status } = await paypalService.authorizeOrder(paypalOrderId);
    return res.json({ authorizationId, status });
  } catch (err) {
    console.error('[/api/paypal/authorize] Error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to authorize PayPal order' });
  }
});

module.exports = router;
