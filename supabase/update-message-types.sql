-- ============================================
-- Update listing_messages message_type constraint
-- Run this in your Supabase SQL Editor
-- ============================================

-- Drop the old constraint and add the new one
ALTER TABLE listing_messages
  DROP CONSTRAINT IF EXISTS listing_messages_message_type_check;

ALTER TABLE listing_messages
  ADD CONSTRAINT listing_messages_message_type_check
  CHECK (message_type IN ('request_showing', 'make_offer', 'ask_question'));
