'use strict';

/**
 * env.js — Single source of truth for all environment variables.
 * Throws clearly at startup if any required variable is missing,
 * rather than failing silently mid-request.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const required = [
  'PRINTFUL_API_KEY',
  'PRINTFUL_WEBHOOK_SECRET',
  'STRIPE_SECRET_KEY',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `[AYITI Server] Missing required environment variables:\n  ${missing.join('\n  ')}\n\nCopy .env.example to .env and fill in all values.`
  );
}

module.exports = {
  // Server
  PORT: parseInt(process.env.PORT || '3001', 10),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Printful
  PRINTFUL_API_KEY: process.env.PRINTFUL_API_KEY,
  PRINTFUL_WEBHOOK_SECRET: process.env.PRINTFUL_WEBHOOK_SECRET,
  PRINTFUL_BASE_URL: 'https://api.printful.com',

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',

  // PayPal
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  PAYPAL_MODE: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' | 'live'

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
};
