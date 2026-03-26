-- ============================================
-- Buy Box Feature Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Buy box forms (one per seller, customizable)
create table if not exists buy_box_forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'My Buyer Criteria Form',
  slug text unique not null,
  description text default 'Fill out this form so I can match you with the right deals.',
  fields jsonb not null default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Buy box submissions (buyer entries)
create table if not exists buy_box_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references buy_box_forms(id) on delete cascade not null,
  -- Contact
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  company_name text,
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
  -- Experience
  deals_completed integer,
  years_experience integer,
  -- Notes
  additional_notes text,
  -- Timestamps
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table buy_box_forms enable row level security;
alter table buy_box_submissions enable row level security;

-- Forms: owners can manage their own forms
create policy "Users can view own forms"
  on buy_box_forms for select
  using (auth.uid() = user_id);

create policy "Users can create forms"
  on buy_box_forms for insert
  with check (auth.uid() = user_id);

create policy "Users can update own forms"
  on buy_box_forms for update
  using (auth.uid() = user_id);

create policy "Users can delete own forms"
  on buy_box_forms for delete
  using (auth.uid() = user_id);

-- Forms: public can view active forms (for the public form page)
create policy "Public can view active forms"
  on buy_box_forms for select
  using (is_active = true);

-- Submissions: form owners can view submissions to their forms
create policy "Form owners can view submissions"
  on buy_box_submissions for select
  using (
    exists (
      select 1 from buy_box_forms
      where buy_box_forms.id = buy_box_submissions.form_id
      and buy_box_forms.user_id = auth.uid()
    )
  );

-- Submissions: form owners can delete submissions
create policy "Form owners can delete submissions"
  on buy_box_submissions for delete
  using (
    exists (
      select 1 from buy_box_forms
      where buy_box_forms.id = buy_box_submissions.form_id
      and buy_box_forms.user_id = auth.uid()
    )
  );

-- Submissions: anyone can insert (public form)
create policy "Anyone can submit to active forms"
  on buy_box_submissions for insert
  with check (
    exists (
      select 1 from buy_box_forms
      where buy_box_forms.id = buy_box_submissions.form_id
      and buy_box_forms.is_active = true
    )
  );
