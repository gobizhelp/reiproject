-- ============================================
-- Email Digest Settings Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Buyer email digest preferences
create table if not exists email_digest_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  enabled boolean not null default false,
  send_hour integer not null default 8 check (send_hour >= 0 and send_hour <= 23),
  timezone text not null default 'America/New_York',
  last_sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for efficient cron lookups: find all enabled digests for a given hour
create index if not exists idx_email_digest_enabled_hour
  on email_digest_settings (send_hour)
  where enabled = true;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table email_digest_settings enable row level security;

-- Users can view their own settings
create policy "Users can view own digest settings"
  on email_digest_settings for select
  using (auth.uid() = user_id);

-- Users can create their own settings
create policy "Users can create own digest settings"
  on email_digest_settings for insert
  with check (auth.uid() = user_id);

-- Users can update their own settings
create policy "Users can update own digest settings"
  on email_digest_settings for update
  using (auth.uid() = user_id);

-- Service role can read all (for cron job)
-- Note: service role bypasses RLS by default
