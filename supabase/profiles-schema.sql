-- ============================================
-- Profiles & Buyer Buy Boxes Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- User profiles with role selection
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_role text not null default 'seller' check (user_role in ('seller', 'buyer', 'both')),
  active_view text not null default 'seller' check (active_view in ('seller', 'buyer')),
  full_name text,
  company_name text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Buyer buy boxes (multiple per buyer, tied to their profile)
create table if not exists buyer_buy_boxes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'My Buy Box',
  -- Investment Criteria
  property_types text[] default '{}',
  locations text,
  min_price numeric(12,2),
  max_price numeric(12,2),
  min_beds integer,
  min_baths integer,
  min_sqft integer,
  max_sqft integer,
  -- Financing
  financing_types text[] default '{}',
  proof_of_funds boolean,
  closing_timeline text,
  -- Property Conditions
  property_conditions text[] default '{}',
  -- Notes
  additional_notes text,
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table profiles enable row level security;
alter table buyer_buy_boxes enable row level security;

-- Profiles: users can manage their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can create own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Buyer buy boxes: users can manage their own
create policy "Users can view own buy boxes"
  on buyer_buy_boxes for select
  using (auth.uid() = user_id);

create policy "Users can create buy boxes"
  on buyer_buy_boxes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own buy boxes"
  on buyer_buy_boxes for update
  using (auth.uid() = user_id);

create policy "Users can delete own buy boxes"
  on buyer_buy_boxes for delete
  using (auth.uid() = user_id);

-- ============================================
-- Function to auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
