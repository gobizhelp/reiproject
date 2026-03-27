-- ============================================
-- Seller Status: pending, sold, archived support
-- ============================================

-- Add seller_status column to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS seller_status text DEFAULT 'active'
  CHECK (seller_status IN ('active', 'pending', 'sold', 'archived'));

-- Index for efficient filtering on dashboard and marketplace
CREATE INDEX IF NOT EXISTS idx_properties_seller_status ON properties (seller_status);
