-- ============================================
-- Admin Settings Key-Value Store
-- Run this in your Supabase SQL Editor
-- ============================================

-- Generic key-value store for admin-managed settings and state
CREATE TABLE IF NOT EXISTS admin_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed — all access goes through service role client.
