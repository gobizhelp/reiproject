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

-- Listing messages (interested / more info inquiries)
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
create policy "Users can view own saved listings"
  on saved_listings for select
  using (auth.uid() = user_id);

create policy "Users can save listings"
  on saved_listings for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave listings"
  on saved_listings for delete
  using (auth.uid() = user_id);

-- Listing messages: senders can create, both parties can view
create policy "Users can send messages"
  on listing_messages for insert
  with check (auth.uid() = sender_id);

create policy "Senders can view own sent messages"
  on listing_messages for select
  using (auth.uid() = sender_id);

create policy "Recipients can view received messages"
  on listing_messages for select
  using (auth.uid() = recipient_id);

create policy "Recipients can mark messages as read"
  on listing_messages for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- ============================================
-- Indexes
-- ============================================

create index if not exists idx_saved_listings_user on saved_listings(user_id);
create index if not exists idx_saved_listings_property on saved_listings(property_id);
create index if not exists idx_listing_messages_recipient on listing_messages(recipient_id, is_read);
create index if not exists idx_listing_messages_sender on listing_messages(sender_id);
create index if not exists idx_listing_messages_property on listing_messages(property_id);
