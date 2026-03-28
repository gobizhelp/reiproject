-- =============================================
-- Instant Email Alerts Tracking
-- Tracks which properties have had instant alerts
-- sent for each tier to avoid duplicate sends.
-- =============================================

-- Track instant alert dispatch per property per tier
create table if not exists instant_alert_log (
  id uuid default gen_random_uuid() primary key,
  property_id uuid not null references properties(id) on delete cascade,
  tier text not null check (tier in ('elite', 'pro')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  scheduled_for timestamptz, -- null for elite (immediate), set for pro (after early access)
  sent_at timestamptz,
  recipients_count int default 0,
  error_message text,
  created_at timestamptz default now()
);

-- Index for cron job to find pending pro alerts efficiently
create index if not exists idx_instant_alert_log_pending
  on instant_alert_log (status, tier, scheduled_for)
  where status = 'pending';

-- Unique constraint: one alert per property per tier
create unique index if not exists idx_instant_alert_log_property_tier
  on instant_alert_log (property_id, tier);

-- RLS: only service role should access this table
alter table instant_alert_log enable row level security;
