-- ============================================
-- Conversations & Direct Messages Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Conversations: one per buyer-property pair, initiated by buyer actions
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade not null,
  buyer_id uuid references auth.users(id) on delete cascade not null,
  seller_id uuid references auth.users(id) on delete cascade not null,
  -- Contact sharing: buyer opts in, then both see each other's details
  buyer_shared_contact boolean default false,
  -- Initial action that started the conversation
  initial_action text not null check (initial_action in ('request_showing', 'make_offer', 'ask_question')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- One conversation per buyer per property
  unique(buyer_id, property_id)
);

-- Conversation messages: the back-and-forth chat
create table if not exists conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete cascade not null,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table conversations enable row level security;
alter table conversation_messages enable row level security;

-- Conversations: both parties can view
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Buyers can view own conversations') THEN
    CREATE POLICY "Buyers can view own conversations" ON conversations FOR SELECT USING (auth.uid() = buyer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Sellers can view own conversations') THEN
    CREATE POLICY "Sellers can view own conversations" ON conversations FOR SELECT USING (auth.uid() = seller_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Buyers can create conversations') THEN
    CREATE POLICY "Buyers can create conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Participants can update conversations') THEN
    CREATE POLICY "Participants can update conversations" ON conversations FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
  END IF;
END $$;

-- Conversation messages: participants can view and create
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_messages' AND policyname = 'Participants can view messages') THEN
    CREATE POLICY "Participants can view messages" ON conversation_messages FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM conversations
        WHERE conversations.id = conversation_messages.conversation_id
        AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_messages' AND policyname = 'Participants can send messages') THEN
    CREATE POLICY "Participants can send messages" ON conversation_messages FOR INSERT WITH CHECK (
      auth.uid() = sender_id AND
      EXISTS (
        SELECT 1 FROM conversations
        WHERE conversations.id = conversation_messages.conversation_id
        AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
      )
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_messages' AND policyname = 'Recipients can mark messages read') THEN
    CREATE POLICY "Recipients can mark messages read" ON conversation_messages FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM conversations
        WHERE conversations.id = conversation_messages.conversation_id
        AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
      )
      AND sender_id != auth.uid()
    );
  END IF;
END $$;

-- ============================================
-- Indexes
-- ============================================

create index if not exists idx_conversations_buyer on conversations(buyer_id);
create index if not exists idx_conversations_seller on conversations(seller_id);
create index if not exists idx_conversations_property on conversations(property_id);
create index if not exists idx_conversation_messages_conversation on conversation_messages(conversation_id, created_at);
create index if not exists idx_conversation_messages_sender on conversation_messages(sender_id);
