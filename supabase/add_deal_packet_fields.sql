-- ============================================
-- Migration: Add new deal packet fields
-- Run this in your Supabase SQL Editor if you
-- already have an existing properties table.
-- ============================================

-- Title & Property Info
alter table properties add column if not exists title text;
alter table properties add column if not exists listing_status text default 'off_market' check (listing_status in ('off_market', 'listed'));
alter table properties add column if not exists ideal_investor_strategy text;
alter table properties add column if not exists basement_description text;
alter table properties add column if not exists neighborhood_notes text;
alter table properties add column if not exists condition_summary text;
alter table properties add column if not exists comps_summary text;

-- Rehab Budgets (ranges)
alter table properties add column if not exists light_rehab_budget_low numeric(12,2);
alter table properties add column if not exists light_rehab_budget_high numeric(12,2);
alter table properties add column if not exists full_rehab_budget_low numeric(12,2);
alter table properties add column if not exists full_rehab_budget_high numeric(12,2);

-- ARV (expanded)
alter table properties add column if not exists light_rehab_arv numeric(12,2);
alter table properties add column if not exists full_rehab_arv_low numeric(12,2);
alter table properties add column if not exists full_rehab_arv_high numeric(12,2);

-- Rental Projections
alter table properties add column if not exists rent_after_reno_low numeric(10,2);
alter table properties add column if not exists rent_after_reno_high numeric(10,2);
alter table properties add column if not exists rent_after_reno_basement_low numeric(10,2);
alter table properties add column if not exists rent_after_reno_basement_high numeric(10,2);

-- Deal Narrative
alter table properties add column if not exists renovation_overview text;
alter table properties add column if not exists why_deal_is_strong text;
