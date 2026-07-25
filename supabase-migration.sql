-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- Index for webhook lookups by subscription_id
CREATE INDEX IF NOT EXISTS idx_settings_stripe_subscription_id
  ON settings(stripe_subscription_id);
