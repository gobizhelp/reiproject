-- ============================================
-- Notifications table for buyer/seller alerts
-- ============================================

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  -- Optional references for deep-linking
  property_id uuid references properties(id) on delete set null,
  conversation_id uuid references conversations(id) on delete set null,
  listing_message_id uuid references listing_messages(id) on delete set null,
  -- Read/dismiss state
  is_read boolean default false,
  read_at timestamptz,
  -- Metadata (flexible JSON for type-specific data)
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_notifications_user_unread on notifications(user_id, is_read, created_at desc);
create index if not exists idx_notifications_user_created on notifications(user_id, created_at desc);
create index if not exists idx_notifications_type on notifications(user_id, type);

-- RLS
alter table notifications enable row level security;

create policy "Users can view own notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on notifications for update using (auth.uid() = user_id);

-- System/triggers insert notifications, not users directly
create policy "Service role can insert notifications"
  on notifications for insert with check (true);

-- ============================================
-- Trigger: notify buyers when seller_status changes
-- on properties they saved or have in their pipeline
-- ============================================

create or replace function notify_seller_status_change()
returns trigger as $$
declare
  status_label text;
  prop_name text;
begin
  -- Only fire if seller_status actually changed
  if OLD.seller_status is not distinct from NEW.seller_status then
    return NEW;
  end if;

  -- Only notify for published properties
  if NEW.status != 'published' then
    return NEW;
  end if;

  -- Build human-readable status label
  status_label := case NEW.seller_status
    when 'pending' then 'Pending'
    when 'sold' then 'Sold'
    when 'archived' then 'Off Market'
    when 'active' then 'Active'
    else NEW.seller_status
  end;

  prop_name := coalesce(NEW.title, NEW.street_address);

  -- Notify buyers who saved this property
  insert into notifications (user_id, type, title, message, property_id, priority, metadata)
  select
    sl.user_id,
    'listing_status_changed',
    'Listing Update',
    case NEW.seller_status
      when 'pending' then format('%s is now under contract (Pending)', prop_name)
      when 'sold' then format('%s has been marked as Sold', prop_name)
      when 'archived' then format('%s has been taken off the market', prop_name)
      when 'active' then format('%s is back on the market!', prop_name)
      else format('Status changed to %s on %s', status_label, prop_name)
    end,
    NEW.id,
    case when NEW.seller_status in ('sold', 'pending') then 'high' else 'medium' end,
    jsonb_build_object(
      'old_status', OLD.seller_status,
      'new_status', NEW.seller_status,
      'street_address', NEW.street_address,
      'city', NEW.city,
      'state', NEW.state,
      'slug', NEW.slug
    )
  from saved_listings sl
  where sl.property_id = NEW.id;

  -- Notify buyers who have this property in their deal pipeline
  -- (avoid duplicate if they also have it saved)
  insert into notifications (user_id, type, title, message, property_id, priority, metadata)
  select
    ds.user_id,
    'listing_status_changed',
    'Pipeline Update',
    case NEW.seller_status
      when 'pending' then format('%s is now under contract (Pending)', prop_name)
      when 'sold' then format('%s has been marked as Sold', prop_name)
      when 'archived' then format('%s has been taken off the market', prop_name)
      when 'active' then format('%s is back on the market!', prop_name)
      else format('Status changed to %s on %s', status_label, prop_name)
    end,
    NEW.id,
    case when NEW.seller_status in ('sold', 'pending') then 'high' else 'medium' end,
    jsonb_build_object(
      'old_status', OLD.seller_status,
      'new_status', NEW.seller_status,
      'street_address', NEW.street_address,
      'city', NEW.city,
      'state', NEW.state,
      'slug', NEW.slug,
      'pipeline_stage', ds.stage
    )
  from deal_stages ds
  where ds.property_id = NEW.id
    and ds.stage != 'passed'
    and not exists (
      select 1 from saved_listings sl
      where sl.user_id = ds.user_id and sl.property_id = NEW.id
    );

  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_notify_seller_status_change
  after update on properties
  for each row execute function notify_seller_status_change();
