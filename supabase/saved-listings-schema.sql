-- ============================================
-- Saved Listings & Listing Messages Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Saved listings (buyer bookmarks)
create table if not exists saved_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  property_id uuid references properties(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, property_id)
);

-- Listing messages (showing requests, offers, questions)
create table if not exists listing_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete cascade not null,
  recipient_id uuid references auth.users(id) on delete cascade not null,
  property_id uuid references properties(id) on delete cascade not null,
  message_type text not null check (message_type in ('request_showing', 'make_offer', 'ask_question')),
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table saved_listings enable row level security;
alter table listing_messages enable row level security;

-- Saved listings: users can manage their own
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_listings' AND policyname = 'Users can view own saved listings') THEN
    CREATE POLICY "Users can view own saved listings" ON saved_listings FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_listings' AND policyname = 'Users can save listings') THEN
    CREATE POLICY "Users can save listings" ON saved_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_listings' AND policyname = 'Users can unsave listings') THEN
    CREATE POLICY "Users can unsave listings" ON saved_listings FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Listing messages: senders can create, both parties can view
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'listing_messages' AND policyname = 'Users can send messages') THEN
    CREATE POLICY "Users can send messages" ON listing_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'listing_messages' AND policyname = 'Senders can view own sent messages') THEN
    CREATE POLICY "Senders can view own sent messages" ON listing_messages FOR SELECT USING (auth.uid() = sender_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'listing_messages' AND policyname = 'Recipients can view received messages') THEN
    CREATE POLICY "Recipients can view received messages" ON listing_messages FOR SELECT USING (auth.uid() = recipient_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'listing_messages' AND policyname = 'Recipients can mark messages as read') THEN
    CREATE POLICY "Recipients can mark messages as read" ON listing_messages FOR UPDATE USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);
  END IF;
END $$;

-- ============================================
-- Indexes
-- ============================================

create index if not exists idx_saved_listings_user on saved_listings(user_id);
create index if not exists idx_saved_listings_property on saved_listings(property_id);
create index if not exists idx_listing_messages_recipient on listing_messages(recipient_id, is_read);
create index if not exists idx_listing_messages_sender on listing_messages(sender_id);
create index if not exists idx_listing_messages_property on listing_messages(property_id);
