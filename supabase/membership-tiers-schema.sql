-- ============================================
-- Membership Tiers & Subscriptions Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Membership plans reference table
create table if not exists membership_plans (
  id text primary key,
  name text not null,
  description text,
  plan_type text not null check (plan_type in ('buyer', 'seller', 'both')),
  tier text not null check (tier in ('free', 'pro', 'elite')),
  monthly_price_cents integer not null default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- User subscriptions
create table if not exists user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_id text references membership_plans(id) not null,
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start timestamptz default now(),
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add tier fields to profiles for quick lookups
alter table profiles add column if not exists buyer_tier text default 'free' check (buyer_tier in ('free', 'pro', 'elite'));
alter table profiles add column if not exists seller_tier text default 'free' check (seller_tier in ('free', 'pro', 'elite'));

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table membership_plans enable row level security;
alter table user_subscriptions enable row level security;

-- Membership plans: readable by everyone (public pricing info)
create policy "Anyone can view active plans"
  on membership_plans for select
  using (is_active = true);

-- Admins can manage plans
create policy "Admins can manage plans"
  on membership_plans for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- User subscriptions: users can view their own
create policy "Users can view own subscriptions"
  on user_subscriptions for select
  using (auth.uid() = user_id);

-- Admins can manage all subscriptions
create policy "Admins can manage subscriptions"
  on user_subscriptions for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.is_admin = true
    )
  );

-- ============================================
-- Indexes
-- ============================================

create index if not exists idx_user_subscriptions_user_id on user_subscriptions(user_id);
create index if not exists idx_user_subscriptions_status on user_subscriptions(status);
create index if not exists idx_user_subscriptions_plan_id on user_subscriptions(plan_id);
create index if not exists idx_profiles_buyer_tier on profiles(buyer_tier);
create index if not exists idx_profiles_seller_tier on profiles(seller_tier);

-- ============================================
-- Seed membership plans
-- ============================================

insert into membership_plans (id, name, description, plan_type, tier, monthly_price_cents) values
  ('free_buyer', 'Free Buyer', 'Browse deals, create one buy box, and get daily alerts.', 'buyer', 'free', 0),
  ('pro_buyer', 'Pro Buyer', 'Instant alerts, more buy boxes, advanced filters, and better targeting.', 'buyer', 'pro', 2900),
  ('elite_buyer', 'Elite Buyer', 'First-look access, team features, and multi-market watchlists.', 'buyer', 'elite', 7900),
  ('free_seller', 'Free Seller', 'List one property and receive buyer inquiries.', 'seller', 'free', 0),
  ('pro_seller', 'Pro Seller', 'List more deals, email matched buyers, and see performance analytics.', 'seller', 'pro', 7900),
  ('elite_seller', 'Elite Seller', 'High-volume listings, SMS blasts, audience segmentation, and team tools.', 'seller', 'elite', 19900),
  ('pro_both', 'Pro Both', 'Combine acquisition and dispo workflows in one account at a discount.', 'both', 'pro', 9900),
  ('elite_both', 'Elite Both', 'All elite buyer and seller features in one discounted subscription.', 'both', 'elite', 24900)
on conflict (id) do nothing;
