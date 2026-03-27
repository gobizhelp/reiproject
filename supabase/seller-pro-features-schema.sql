-- ============================================
-- Seller Pro Features Schema
-- Featured listing badge, branded profiles,
-- listing templates, duplicate listing
-- ============================================

-- === Branded Seller Profile Fields ===
-- Add branding fields to profiles table for Pro sellers
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website text;

-- === Listing Templates Table ===
-- Allows Pro sellers to save and reuse listing formats
CREATE TABLE IF NOT EXISTS listing_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  template_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for listing_templates
CREATE INDEX IF NOT EXISTS idx_listing_templates_user_id ON listing_templates(user_id);

-- RLS for listing_templates
ALTER TABLE listing_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates"
  ON listing_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates"
  ON listing_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON listing_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON listing_templates FOR DELETE
  USING (auth.uid() = user_id);
