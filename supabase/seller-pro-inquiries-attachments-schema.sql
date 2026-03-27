-- ============================================
-- Seller Pro Features: Inquiries Analytics,
-- Attachment Uploads, Inquiry Status Tracking
-- ============================================

-- === Property Attachments Table ===
-- Allows Pro sellers to add files (rehab estimates, comps, flyers, docs) to a listing
CREATE TABLE IF NOT EXISTS property_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  url text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_attachments_property ON property_attachments(property_id);
CREATE INDEX IF NOT EXISTS idx_property_attachments_user ON property_attachments(user_id);

ALTER TABLE property_attachments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'property_attachments' AND policyname = 'Owners can view own attachments') THEN
    CREATE POLICY "Owners can view own attachments" ON property_attachments FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'property_attachments' AND policyname = 'Public can view attachments on published properties') THEN
    CREATE POLICY "Public can view attachments on published properties" ON property_attachments FOR SELECT USING (
      EXISTS (SELECT 1 FROM properties WHERE properties.id = property_attachments.property_id AND properties.status = 'published')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'property_attachments' AND policyname = 'Owners can insert attachments') THEN
    CREATE POLICY "Owners can insert attachments" ON property_attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'property_attachments' AND policyname = 'Owners can delete attachments') THEN
    CREATE POLICY "Owners can delete attachments" ON property_attachments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- === Inquiry Status Tracking ===
-- Add inquiry_status column to conversations table for sellers to track inquiry progress
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS inquiry_status text NOT NULL DEFAULT 'new'
  CHECK (inquiry_status IN ('new', 'contacted', 'negotiating', 'closed_won', 'closed_lost'));
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS inquiry_status_updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_conversations_inquiry_status ON conversations(seller_id, inquiry_status);
