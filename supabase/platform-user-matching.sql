-- ============================================
-- Platform User Matching RPC
-- Checks if buyer submissions match platform users by email or phone
-- Run this in your Supabase SQL Editor
-- ============================================

-- Function to check which emails/phones belong to registered platform users
-- Returns matching emails and phones so the seller can see a badge on buyer cards
create or replace function check_platform_users(check_emails text[], check_phones text[])
returns table(matched_email text, matched_phone text) as $$
begin
  return query
  select distinct
    u.email::text as matched_email,
    p.phone::text as matched_phone
  from auth.users u
  left join profiles p on p.id = u.id
  where
    (u.email = any(check_emails))
    or (p.phone is not null and p.phone != '' and p.phone = any(check_phones));
end;
$$ language plpgsql security definer;
