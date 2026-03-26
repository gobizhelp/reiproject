-- ============================================
-- Saved Searches Schema
-- Allows Pro+ buyers to save filter combinations
-- and quickly re-apply them on the marketplace
-- ============================================

-- Saved search filters table
create table if not exists saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  filters jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast lookup by user
create index if not exists idx_saved_searches_user_id on saved_searches(user_id);

-- Unique constraint: no duplicate names per user
create unique index if not exists idx_saved_searches_user_name on saved_searches(user_id, name);

-- RLS policies
alter table saved_searches enable row level security;

-- Users can only see their own saved searches
create policy "Users can view own saved searches"
  on saved_searches for select
  using (auth.uid() = user_id);

-- Users can insert their own saved searches
create policy "Users can create own saved searches"
  on saved_searches for insert
  with check (auth.uid() = user_id);

-- Users can update their own saved searches
create policy "Users can update own saved searches"
  on saved_searches for update
  using (auth.uid() = user_id);

-- Users can delete their own saved searches
create policy "Users can delete own saved searches"
  on saved_searches for delete
  using (auth.uid() = user_id);
