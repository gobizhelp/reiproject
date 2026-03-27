# Notification System Design

## Overview

This document describes the expanded notification system for REI Project, covering both buyer and seller notification needs. The current system is seller-heavy; this design fills in the buyer-side gaps and adds structured notification types for all key user actions.

---

## Current State

### What exists today
- **Real-time in-app notifications** via Supabase Postgres Changes (WebSocket)
- **Two notification types**: `dm` (direct messages) and `general` (listing inquiries)
- **Toast UI** with auto-dismiss, sound toggle, unread badge
- **Seller notifications**: showing requests, offers, questions, DMs
- **Buyer notifications**: DM replies only

### Gaps
- Buyers have no visibility into seller responses to their inquiries (outside DMs)
- No notifications for offer acceptance/rejection, showing confirmation, or price changes
- No persistent notification storage (all in-memory, lost on refresh)
- No email/push notifications
- No notification preferences per user

---

## Expanded Notification Design

### Notification Types by Role

#### Seller Notifications

| Event | Type Key | Title | Sound | Priority |
|-------|----------|-------|-------|----------|
| Buyer requests a showing | `showing_requested` | "Showing Request" | General ping | High |
| Buyer makes an offer | `offer_received` | "New Offer" | General ping | High |
| Buyer asks a question | `question_received` | "New Inquiry" | General ping | Medium |
| Buyer sends a DM | `dm_received` | "New Message" | DM chime | Medium |
| Buyer saves your listing | `listing_saved` | "Listing Saved" | None | Low |
| Listing approved by admin | `listing_approved` | "Listing Approved" | General ping | High |
| Listing flagged/rejected by admin | `listing_flagged` | "Listing Needs Attention" | General ping | High |

#### Buyer Notifications

| Event | Type Key | Title | Sound | Priority |
|-------|----------|-------|-------|----------|
| Seller replies to your DM | `dm_received` | "New Message" | DM chime | Medium |
| Seller responds to your showing request | `showing_responded` | "Showing Update" | General ping | High |
| Seller responds to your offer | `offer_responded` | "Offer Update" | General ping | High |
| Seller answers your question | `question_answered` | "Question Answered" | General ping | Medium |
| Saved listing price changes | `price_changed` | "Price Update" | None | Medium |
| Saved listing status changes (sold, pending, etc.) | `listing_status_changed` | "Listing Update" | None | Medium |
| Saved listing is deleted/unpublished | `listing_removed` | "Listing Removed" | None | Low |
| New listing matches saved search criteria* | `new_listing_match` | "New Listing" | None | Low |

*Future feature — requires saved-search functionality.

---

### Database Schema: `notifications` Table

```sql
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
create index idx_notifications_user_unread on notifications(user_id, is_read, created_at desc);
create index idx_notifications_user_created on notifications(user_id, created_at desc);
create index idx_notifications_type on notifications(user_id, type);

-- RLS
alter table notifications enable row level security;

create policy "Users can view own notifications"
  on notifications for select using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on notifications for update using (auth.uid() = user_id);

-- System/triggers insert notifications, not users directly
create policy "Service role can insert notifications"
  on notifications for insert with check (true);
```

---

### Notification Preferences Table

```sql
create table if not exists notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  -- In-app
  in_app_enabled boolean default true,
  sound_enabled boolean default true,
  -- Email (future)
  email_enabled boolean default false,
  email_frequency text default 'instant' check (email_frequency in ('instant', 'daily_digest', 'weekly_digest', 'off')),
  -- Per-type overrides (JSON map of type_key -> { in_app: bool, email: bool })
  type_overrides jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table notification_preferences enable row level security;

create policy "Users can view own preferences"
  on notification_preferences for select using (auth.uid() = user_id);
create policy "Users can update own preferences"
  on notification_preferences for update using (auth.uid() = user_id);
create policy "Users can insert own preferences"
  on notification_preferences for insert with check (auth.uid() = user_id);
```

---

### How Notifications Get Created

Notifications are created server-side via **Supabase database triggers** or **API route handlers**, not by the client.

#### Option A: Database Triggers (preferred for data-change events)

```sql
-- Example: notify buyers when a saved listing's price changes
create or replace function notify_price_change()
returns trigger as $$
begin
  if OLD.asking_price is distinct from NEW.asking_price then
    insert into notifications (user_id, type, title, message, property_id, metadata)
    select
      sl.user_id,
      'price_changed',
      'Price Update',
      format('Price changed from $%s to $%s on %s',
        coalesce(OLD.asking_price::text, 'N/A'),
        coalesce(NEW.asking_price::text, 'N/A'),
        coalesce(NEW.title, NEW.street_address)),
      NEW.id,
      jsonb_build_object('old_price', OLD.asking_price, 'new_price', NEW.asking_price)
    from saved_listings sl
    where sl.property_id = NEW.id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_notify_price_change
  after update on properties
  for each row execute function notify_price_change();
```

#### Option B: API Route Handlers (for action-driven events)

When a seller responds to a showing request or offer, the API route that handles the response also inserts a notification row for the buyer.

---

### Updated TypeScript Types

```typescript
export type NotificationType =
  | 'dm_received'
  | 'showing_requested'
  | 'showing_responded'
  | 'offer_received'
  | 'offer_responded'
  | 'question_received'
  | 'question_answered'
  | 'listing_saved'
  | 'listing_approved'
  | 'listing_flagged'
  | 'price_changed'
  | 'listing_status_changed'
  | 'listing_removed'
  | 'new_listing_match';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  property_id: string | null;
  conversation_id: string | null;
  listing_message_id: string | null;
  is_read: boolean;
  read_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  in_app_enabled: boolean;
  sound_enabled: boolean;
  email_enabled: boolean;
  email_frequency: 'instant' | 'daily_digest' | 'weekly_digest' | 'off';
  type_overrides: Record<string, { in_app?: boolean; email?: boolean }>;
}
```

---

### Updated Real-Time Provider

The `NotificationProvider` changes from listening to `conversation_messages` and `listing_messages` directly to listening to the **`notifications` table** itself:

```
supabase.channel("user-notifications")
  .on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "notifications",
    filter: `user_id=eq.${userId}`
  }, handleNewNotification)
  .subscribe()
```

This simplifies the client — one subscription handles all notification types. The trigger/API layer is responsible for creating the right notification rows.

---

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications` | List notifications (paginated, filterable by type/read status) |
| PATCH | `/api/notifications/[id]` | Mark single notification as read |
| PATCH | `/api/notifications/read-all` | Mark all notifications as read |
| DELETE | `/api/notifications/[id]` | Delete a notification |
| GET | `/api/notification-preferences` | Get user's notification preferences |
| PUT | `/api/notification-preferences` | Update notification preferences |

---

### UI Components

1. **Notification Bell** (navbar) — replaces current Messages-only badge, shows total unread count across all types
2. **Notification Dropdown/Panel** — grouped by date, filterable by type, mark-as-read controls
3. **Notification Settings Page** — toggle per-type notifications, sound, and future email preferences
4. **Toast System** — remains as-is, now driven by the single `notifications` table subscription

---

## Implementation Phases

### Phase 1: Foundation
- Create `notifications` and `notification_preferences` tables
- Migrate existing `listing_messages` and `conversation_messages` notification logic to insert into `notifications`
- Update `NotificationProvider` to subscribe to `notifications` table
- Persist notifications across page refreshes

### Phase 2: Buyer Notifications
- Add DB triggers for price changes and listing status changes on saved listings
- Add API-level notification creation for showing/offer responses
- Add question-answered notification

### Phase 3: Notification UI
- Notification bell + dropdown panel in navbar
- Notification settings page
- Filter/group notifications by type

### Phase 4: Email Notifications (Future)
- Email delivery via Supabase Edge Functions or external service (Resend, SendGrid)
- Digest options (instant, daily, weekly)
- Unsubscribe links

---

## Summary: Full Notification Matrix

| Event | Buyer Gets | Seller Gets |
|-------|-----------|-------------|
| Buyer requests showing | -- | `showing_requested` |
| Seller responds to showing | `showing_responded` | -- |
| Buyer makes offer | -- | `offer_received` |
| Seller responds to offer | `offer_responded` | -- |
| Buyer asks question | -- | `question_received` |
| Seller answers question | `question_answered` | -- |
| Either party sends DM | `dm_received` | `dm_received` |
| Buyer saves listing | -- | `listing_saved` |
| Saved listing price changes | `price_changed` | -- |
| Saved listing status changes | `listing_status_changed` | -- |
| Saved listing removed | `listing_removed` | -- |
| Admin approves listing | -- | `listing_approved` |
| Admin flags/rejects listing | -- | `listing_flagged` |
