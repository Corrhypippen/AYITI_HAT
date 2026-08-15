-- =============================================================================
-- AYITI Heritage — Webhook Events Table
-- Full audit log of every incoming Printful webhook.
-- Useful for debugging, replaying events, and tracing order issues.
-- =============================================================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Printful event type (e.g. 'package_shipped', 'order_failed')
  event_type          TEXT NOT NULL,

  -- Printful's internal order ID
  printful_order_id   BIGINT,

  -- Our external_id (links back to orders table)
  external_id         TEXT,

  -- Full raw webhook payload saved verbatim
  payload             JSONB NOT NULL,

  -- Whether our handler successfully processed this event
  processed           BOOLEAN NOT NULL DEFAULT false,

  -- Error message if processing failed
  error               TEXT,

  received_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS webhook_events_event_type_idx  ON webhook_events (event_type);
CREATE INDEX IF NOT EXISTS webhook_events_external_id_idx ON webhook_events (external_id);
CREATE INDEX IF NOT EXISTS webhook_events_processed_idx   ON webhook_events (processed);
CREATE INDEX IF NOT EXISTS webhook_events_received_at_idx ON webhook_events (received_at DESC);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
-- Service-role only — no public access to webhook data
