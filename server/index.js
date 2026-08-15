'use strict';

const express = require('express');
const cors = require('cors');
const env = require('./config/env'); // validates env vars at startup

const app = express();

// ──────────────────────────────────────────────────────────────────────────────
// CORS
// ──────────────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ──────────────────────────────────────────────────────────────────────────────
// Body Parsing
//
// IMPORTANT: The webhook route uses express.raw() internally (defined in
// routes/webhooks.js) to preserve the raw body for HMAC verification.
// The global express.json() middleware below does NOT apply to that route
// because express.raw() intercepts first.
// ──────────────────────────────────────────────────────────────────────────────
app.use(express.json({
  limit: '1mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// ──────────────────────────────────────────────────────────────────────────────
// Request Logging (dev only)
// ──────────────────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────────────────────────────────────
app.use('/api/products',          require('./routes/products'));
app.use('/api/checkout',          require('./routes/checkout'));
app.use('/api/printful-webhook',  require('./routes/webhooks'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    store: 'AYITI Heritage',
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// 404 Handler
// ──────────────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ──────────────────────────────────────────────────────────────────────────────
// Global Error Handler
// ──────────────────────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: env.NODE_ENV === 'development' ? err.message : 'Something went wrong.',
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Start
// ──────────────────────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`\n🇭🇹 AYITI Heritage API server running on http://localhost:${env.PORT}`);
  console.log(`   Environment : ${env.NODE_ENV}`);
  console.log(`   Frontend URL: ${env.FRONTEND_URL}`);
  console.log(`   PayPal Mode : ${env.PAYPAL_MODE}`);
  console.log(`\n   Routes:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/products`);
  console.log(`   POST /api/checkout`);
  console.log(`   POST /api/printful-webhook\n`);
});

module.exports = app;
