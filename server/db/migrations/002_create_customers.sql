-- =============================================================================
-- AYITI Heritage — Customers Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS customers (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Primary identifier
  email                    TEXT UNIQUE NOT NULL,
  full_name                TEXT NOT NULL,

  -- Saved shipping address (updated on each order)
  default_shipping_address JSONB,

  -- Lifetime stats (updated via trigger or server logic after each order)
  total_orders             INTEGER NOT NULL DEFAULT 0,
  total_spent              NUMERIC(10, 2) NOT NULL DEFAULT 0.00,

  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customers_email_idx      ON customers (email);
CREATE INDEX IF NOT EXISTS customers_created_at_idx ON customers (created_at DESC);

CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- Service-role key bypasses RLS for server-side access
