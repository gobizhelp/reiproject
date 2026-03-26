-- ============================================
-- Buyer Notes Schema
-- Private notes buyers can add to listings
-- ============================================

-- Buyer notes (private annotations on properties)
create table if not exists buyer_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  property_id uuid references properties(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, property_id)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table buyer_notes enable row level security;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'buyer_notes' AND policyname = 'Users can view own notes') THEN
    CREATE POLICY "Users can view own notes" ON buyer_notes FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'buyer_notes' AND policyname = 'Users can create notes') THEN
    CREATE POLICY "Users can create notes" ON buyer_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'buyer_notes' AND policyname = 'Users can update own notes') THEN
    CREATE POLICY "Users can update own notes" ON buyer_notes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'buyer_notes' AND policyname = 'Users can delete own notes') THEN
    CREATE POLICY "Users can delete own notes" ON buyer_notes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ============================================
-- Indexes
-- ============================================

create index if not exists idx_buyer_notes_user on buyer_notes(user_id);
create index if not exists idx_buyer_notes_property on buyer_notes(property_id);
create index if not exists idx_buyer_notes_user_property on buyer_notes(user_id, property_id);
