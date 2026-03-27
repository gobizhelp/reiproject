-- Add latitude/longitude columns to properties table for map view
-- Run this in your Supabase SQL Editor

alter table properties add column if not exists latitude double precision;
alter table properties add column if not exists longitude double precision;
