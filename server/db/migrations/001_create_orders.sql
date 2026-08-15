-- =============================================================================
-- AYITI Heritage — Orders Table Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Our internal reference, sent to Printful as external_id
  external_id      TEXT UNIQUE NOT NULL,

  -- Printful's returned order ID (populated after successful Printful order creation)
  printful_id      BIGINT,

  -- Payment details
  payment_method   TEXT NOT NULL CHECK (payment_method IN ('stripe', 'paypal')),
  payment_intent   TEXT,    -- Stripe PaymentIntent ID or PayPal authorization ID

  -- Order lifecycle status
  -- processing    → order record created, payment authorized, Printful call in flight
  -- confirmed     → Printful accepted order, payment captured
  -- shipped       → Printful webhook: package_shipped received
  -- action_required → Printful rejected order or capture failed; payment voided
  -- canceled      → Printful webhook: order_canceled received
  status           TEXT NOT NULL DEFAULT 'processing'
                   CHECK (status IN ('processing', 'confirmed', 'shipped', 'action_required', 'canceled')),

  -- Customer info
  customer_email   TEXT NOT NULL,
  customer_name    TEXT NOT NULL,

  -- Full shipping address as JSON
  shipping_address JSONB NOT NULL,

  -- Cart line items: [{ sku, name, quantity, price, sync_variant_id }]
  line_items       JSONB NOT NULL,

  -- Total amount charged (USD)
  total_amount     NUMERIC(10, 2) NOT NULL,

  -- Printful API error saved verbatim when status = 'action_required'
  printful_error   JSONB,

  -- Shipping info populated by webhook
  tracking_number  TEXT,
  tracking_carrier TEXT,
  shipped_at       TIMESTAMPTZ,

  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS orders_external_id_idx  ON orders (external_id);
CREATE INDEX IF NOT EXISTS orders_status_idx        ON orders (status);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders (customer_email);
CREATE INDEX IF NOT EXISTS orders_created_at_idx    ON orders (created_at DESC);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Row Level Security (optional but recommended)
-- Enable RLS so only your service-role key can read/write from the server.
-- The anon/public role gets no access.
-- =============================================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Service-role bypasses RLS automatically in Supabase, so no explicit policy
-- needed for server-side access. Add admin policies here if you build an admin UI.
