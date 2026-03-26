-- Admin Tools Schema Migration
-- Run this in Supabase SQL Editor

-- Add admin flag to profiles (orthogonal to user_role)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_reason text;

-- Add featured flag and moderation status to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved'
  CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged'));
ALTER TABLE properties ADD COLUMN IF NOT EXISTS moderation_note text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS moderated_at timestamptz;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES auth.users(id);

-- Admin activity log for audit trail
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Indexes for efficient admin queries
CREATE INDEX IF NOT EXISTS idx_properties_moderation ON properties(moderation_status);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_profiles_suspended ON profiles(is_suspended) WHERE is_suspended = true;
CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON admin_activity_log(created_at DESC);

-- Note: No admin-specific RLS policies needed on profiles.
-- All admin operations use the service role client which bypasses RLS.
-- Adding a SELECT policy on profiles that queries profiles causes infinite recursion.
