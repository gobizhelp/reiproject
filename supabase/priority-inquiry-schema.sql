-- ============================================
-- Priority Inquiry Placement
-- Adds priority flag to conversations for Pro/Elite buyers
-- ============================================

-- Add is_priority column to conversations
alter table conversations add column if not exists is_priority boolean default false;

-- Index for sorting priority inquiries first
create index if not exists idx_conversations_priority on conversations(seller_id, is_priority desc, updated_at desc);
