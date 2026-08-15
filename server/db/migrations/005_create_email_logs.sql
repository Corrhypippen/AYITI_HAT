-- =============================================================================
-- AYITI Heritage — Email Logs Table
-- Tracks every email sent via Resend for audit and de-duplication.
-- =============================================================================

CREATE TABLE IF NOT EXISTS email_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links back to orders table
  external_id TEXT NOT NULL,

  -- Type of email sent
  email_type  TEXT NOT NULL CHECK (email_type IN ('order_confirmation', 'shipment_notification')),

  -- Who it was sent to
  recipient   TEXT NOT NULL,

  -- Resend's returned email ID (for support lookups)
  resend_id   TEXT,

  -- Whether the Resend API call succeeded
  status      TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),

  -- Error message if status = 'failed'
  error       TEXT,

  sent_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_logs_external_id_idx ON email_logs (external_id);
CREATE INDEX IF NOT EXISTS email_logs_recipient_idx   ON email_logs (recipient);
CREATE INDEX IF NOT EXISTS email_logs_email_type_idx  ON email_logs (email_type);
CREATE INDEX IF NOT EXISTS email_logs_sent_at_idx     ON email_logs (sent_at DESC);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
-- Service-role only — email addresses are PII
