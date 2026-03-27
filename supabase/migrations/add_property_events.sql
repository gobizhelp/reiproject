-- Property analytics events table
-- Tracks impressions, clicks, views for seller analytics (Pro+)

create table if not exists property_events (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  event_type text not null check (event_type in ('impression', 'click', 'view')),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Indexes for fast aggregation queries
create index idx_property_events_property_id on property_events(property_id);
create index idx_property_events_type on property_events(event_type);
create index idx_property_events_created_at on property_events(created_at);
create index idx_property_events_property_type on property_events(property_id, event_type);

-- RLS policies
alter table property_events enable row level security;

-- Anyone can insert events (for anonymous impression tracking)
create policy "Anyone can insert property events"
  on property_events for insert
  with check (true);

-- Sellers can read events for their own properties
create policy "Sellers can read events for own properties"
  on property_events for select
  using (
    property_id in (
      select id from properties where user_id = auth.uid()
    )
  );

-- Admins can read all events
create policy "Admins can read all events"
  on property_events for select
  using (
    exists (
      select 1 from profiles where id = auth.uid() and is_admin = true
    )
  );
