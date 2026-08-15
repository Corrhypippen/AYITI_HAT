-- =============================================================================
-- AYITI Heritage — Products Cache Table
-- Stores Printful product data + our custom UI metadata locally.
-- Updated whenever the /api/products endpoint refreshes from Printful.
-- =============================================================================

CREATE TABLE IF NOT EXISTS products_cache (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Our SKU (matches STATIC_PRODUCTS in App.jsx and printfulVariants.js)
  sku                  TEXT UNIQUE NOT NULL,

  -- Printful IDs
  printful_variant_id  INTEGER,   -- catalog variant_id used in order line items
  printful_product_id  INTEGER,   -- store product ID

  -- Display fields
  name                 TEXT NOT NULL,
  colorway             TEXT,
  category             TEXT,       -- 'Structured' | 'Unstructured'
  price                NUMERIC(10, 2) NOT NULL DEFAULT 30.00,
  in_stock             BOOLEAN NOT NULL DEFAULT true,

  -- All other display metadata (badge, features, details, views, hex, etc.)
  metadata             JSONB,

  synced_at            TIMESTAMPTZ DEFAULT NOW(),
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS products_cache_sku_idx      ON products_cache (sku);
CREATE INDEX IF NOT EXISTS products_cache_in_stock_idx ON products_cache (in_stock);
CREATE INDEX IF NOT EXISTS products_cache_category_idx ON products_cache (category);

CREATE OR REPLACE FUNCTION update_products_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_cache_updated_at ON products_cache;
CREATE TRIGGER products_cache_updated_at
  BEFORE UPDATE ON products_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_products_cache_updated_at();

ALTER TABLE products_cache ENABLE ROW LEVEL SECURITY;

-- Products are safe to read publicly (no sensitive data)
CREATE POLICY "Products are publicly readable"
  ON products_cache FOR SELECT
  USING (true);
