-- ============================================
-- Deal Stages Schema (Buyer Deal Pipeline)
-- Run this in your Supabase SQL Editor
-- ============================================

-- Deal stages: tracks which pipeline stage a property is in for a buyer
create table if not exists deal_stages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  property_id uuid references properties(id) on delete cascade not null,
  stage text not null default 'saved' check (stage in ('saved', 'reviewing', 'contacted', 'passed')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, property_id)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table deal_stages enable row level security;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deal_stages' AND policyname = 'Users can view own deal stages') THEN
    CREATE POLICY "Users can view own deal stages" ON deal_stages FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deal_stages' AND policyname = 'Users can create deal stages') THEN
    CREATE POLICY "Users can create deal stages" ON deal_stages FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deal_stages' AND policyname = 'Users can update own deal stages') THEN
    CREATE POLICY "Users can update own deal stages" ON deal_stages FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'deal_stages' AND policyname = 'Users can delete own deal stages') THEN
    CREATE POLICY "Users can delete own deal stages" ON deal_stages FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- Indexes
-- ============================================

create index if not exists idx_deal_stages_user on deal_stages(user_id);
create index if not exists idx_deal_stages_user_stage on deal_stages(user_id, stage);
create index if not exists idx_deal_stages_property on deal_stages(property_id);

-- ============================================
-- Auto-update updated_at trigger
-- ============================================

create or replace function update_deal_stages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists deal_stages_updated_at on deal_stages;
create trigger deal_stages_updated_at
  before update on deal_stages
  for each row
  execute function update_deal_stages_updated_at();
