-- ============================================
-- Elite Buyer Early Access
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add published_at timestamp to track when a property was first published
ALTER TABLE properties ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Backfill: set published_at = created_at for existing published properties
UPDATE properties SET published_at = created_at WHERE status = 'published' AND published_at IS NULL;

-- Seed the default early access duration (24 hours)
INSERT INTO admin_settings (key, value, updated_at)
VALUES ('elite_early_access_hours', '24', now())
ON CONFLICT (key) DO NOTHING;
