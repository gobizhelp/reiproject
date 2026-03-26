-- ============================================
-- DealPacket Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Properties table
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  slug text unique not null,
  status text default 'draft' check (status in ('draft', 'published')),
  -- Title & Address
  title text,
  street_address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  -- Property Info
  listing_status text default 'off_market' check (listing_status in ('off_market', 'listed')),
  ideal_investor_strategy text,
  property_type text default 'Single Family',
  beds integer,
  baths numeric(3,1),
  sqft integer,
  year_built integer,
  lot_size text,
  basement_description text,
  neighborhood_notes text,
  condition_summary text,
  comps_summary text,
  -- Financials
  asking_price numeric(12,2),
  arv numeric(12,2),
  repair_estimate numeric(12,2),
  assignment_fee numeric(12,2),
  show_assignment_fee boolean default false,
  light_rehab_budget_low numeric(12,2),
  light_rehab_budget_high numeric(12,2),
  full_rehab_budget_low numeric(12,2),
  full_rehab_budget_high numeric(12,2),
  light_rehab_arv numeric(12,2),
  full_rehab_arv_low numeric(12,2),
  full_rehab_arv_high numeric(12,2),
  -- Rental Projections
  rent_after_reno_low numeric(10,2),
  rent_after_reno_high numeric(10,2),
  rent_after_reno_basement_low numeric(10,2),
  rent_after_reno_basement_high numeric(10,2),
  -- Deal Narrative
  renovation_overview text,
  why_deal_is_strong text,
  -- Contact
  showing_instructions text,
  contact_name text,
  contact_phone text,
  contact_email text,
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Property photos
create table if not exists property_photos (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade not null,
  url text not null,
  storage_path text not null,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- Comparable sales
create table if not exists comps (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade not null,
  address text not null,
  sale_price numeric(12,2),
  sqft integer,
  beds integer,
  baths numeric(3,1),
  date_sold date,
  distance text,
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table properties enable row level security;
alter table property_photos enable row level security;
alter table comps enable row level security;

-- Properties: owners can do everything
create policy "Users can view own properties"
  on properties for select
  using (auth.uid() = user_id);

create policy "Users can create properties"
  on properties for insert
  with check (auth.uid() = user_id);

create policy "Users can update own properties"
  on properties for update
  using (auth.uid() = user_id);

create policy "Users can delete own properties"
  on properties for delete
  using (auth.uid() = user_id);

-- Properties: public can view published
create policy "Public can view published properties"
  on properties for select
  using (status = 'published');

-- Photos: owners CRUD
create policy "Users can manage own photos"
  on property_photos for all
  using (
    exists (
      select 1 from properties
      where properties.id = property_photos.property_id
      and properties.user_id = auth.uid()
    )
  );

-- Photos: allow insert for any authenticated user (for new properties with placeholder ID)
create policy "Authenticated users can insert photos"
  on property_photos for insert
  with check (auth.uid() is not null);

-- Photos: public can view photos of published properties
create policy "Public can view published property photos"
  on property_photos for select
  using (
    exists (
      select 1 from properties
      where properties.id = property_photos.property_id
      and properties.status = 'published'
    )
  );

-- Comps: owners CRUD
create policy "Users can manage own comps"
  on comps for all
  using (
    exists (
      select 1 from properties
      where properties.id = comps.property_id
      and properties.user_id = auth.uid()
    )
  );

-- Comps: public can view comps of published properties
create policy "Public can view published property comps"
  on comps for select
  using (
    exists (
      select 1 from properties
      where properties.id = comps.property_id
      and properties.status = 'published'
    )
  );

-- ============================================
-- Storage
-- ============================================
-- Create a storage bucket for property photos
-- Note: Run these in the Supabase Dashboard > Storage > Create Bucket
-- Bucket name: property-photos
-- Public: Yes (so images are publicly accessible)
-- Or run via SQL:

insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Anyone can view property photos"
  on storage.objects for select
  using (bucket_id = 'property-photos');

create policy "Authenticated users can upload photos"
  on storage.objects for insert
  with check (bucket_id = 'property-photos' and auth.role() = 'authenticated');

create policy "Users can delete own photos"
  on storage.objects for delete
  using (bucket_id = 'property-photos' and auth.role() = 'authenticated');
