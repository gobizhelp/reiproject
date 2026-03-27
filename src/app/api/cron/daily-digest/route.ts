import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getResend, EMAIL_FROM } from '@/lib/email';
import { matchProperties } from '@/lib/matching';
import { buildDailyDigestHtml, buildNoMatchesHtml } from '@/lib/email-templates/daily-digest';
import type { Property } from '@/lib/types';
import type { BuyerBuyBox } from '@/lib/profile-types';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max for Vercel

/**
 * GET /api/cron/daily-digest
 *
 * Triggered by Vercel Cron every hour. Finds buyers whose digest send_hour
 * matches the current hour in their configured timezone, then sends them a
 * digest of new matching listings.
 *
 * Requires CRON_SECRET header for authentication.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const resend = getResend();

  // Determine which hours we should process — check each timezone to see what
  // local hour it currently is, then find matching digest settings.
  const now = new Date();
  const targetTimezones = getTimezoneHourMap(now);

  // Fetch all enabled digest settings where (timezone, send_hour) matches now
  const { data: digestSettings, error: settingsError } = await supabase
    .from('email_digest_settings')
    .select('*')
    .eq('enabled', true);

  if (settingsError) {
    return Response.json({ error: settingsError.message }, { status: 500 });
  }

  if (!digestSettings || digestSettings.length === 0) {
    return Response.json({ message: 'No enabled digests', sent: 0 });
  }

  // Filter to only buyers whose send_hour matches the current hour in their timezone
  const eligibleSettings = digestSettings.filter((s) => {
    const currentHourInTz = targetTimezones.get(s.timezone);
    return currentHourInTz !== undefined && currentHourInTz === s.send_hour;
  });

  if (eligibleSettings.length === 0) {
    return Response.json({ message: 'No digests due this hour', sent: 0 });
  }

  // Fetch all published properties from the last 24 hours
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const { data: recentProperties, error: propsError } = await supabase
    .from('properties')
    .select('*, property_photos(id, url, display_order)')
    .eq('status', 'published')
    .eq('moderation_status', 'approved')
    .gte('published_at', oneDayAgo)
    .order('published_at', { ascending: false });

  if (propsError) {
    return Response.json({ error: propsError.message }, { status: 500 });
  }

  const properties = (recentProperties || []) as (Property & {
    property_photos: { id: string; url: string; display_order: number }[];
  })[];

  // Process each eligible buyer
  const userIds = eligibleSettings.map((s) => s.user_id);

  // Fetch all buy boxes for these users in one query
  const { data: allBuyBoxes, error: boxError } = await supabase
    .from('buyer_buy_boxes')
    .select('*')
    .in('user_id', userIds);

  if (boxError) {
    return Response.json({ error: boxError.message }, { status: 500 });
  }

  // Fetch profiles for names and emails
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  if (profileError) {
    return Response.json({ error: profileError.message }, { status: 500 });
  }

  // Fetch emails from auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    return Response.json({ error: authError.message }, { status: 500 });
  }

  const emailMap = new Map<string, string>();
  for (const u of authUsers.users) {
    if (u.email) emailMap.set(u.id, u.email);
  }

  const profileMap = new Map<string, string | null>();
  for (const p of profiles || []) {
    profileMap.set(p.id, p.full_name);
  }

  // Group buy boxes by user
  const buyBoxesByUser = new Map<string, BuyerBuyBox[]>();
  for (const box of allBuyBoxes || []) {
    const existing = buyBoxesByUser.get(box.user_id) || [];
    existing.push(box);
    buyBoxesByUser.set(box.user_id, existing);
  }

  let sentCount = 0;
  let skipCount = 0;
  const errors: string[] = [];

  for (const setting of eligibleSettings) {
    const userId = setting.user_id;
    const email = emailMap.get(userId);
    const name = profileMap.get(userId) ?? null;
    const buyBoxes = buyBoxesByUser.get(userId) || [];

    if (!email) {
      skipCount++;
      continue;
    }

    if (buyBoxes.length === 0) {
      skipCount++;
      continue;
    }

    // Match properties against this buyer's buy boxes
    const matches = matchProperties(properties, buyBoxes);

    // Build email HTML
    const html =
      matches.length > 0
        ? buildDailyDigestHtml(name, matches)
        : buildNoMatchesHtml(name);

    const subject =
      matches.length > 0
        ? `${matches.length} new deal${matches.length === 1 ? '' : 's'} matching your buy box`
        : 'Your daily deal digest — no new matches today';

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject,
        html,
      });

      // Update last_sent_at
      await supabase
        .from('email_digest_settings')
        .update({ last_sent_at: now.toISOString() })
        .eq('user_id', userId);

      sentCount++;
    } catch (err) {
      errors.push(`Failed to send to ${userId}: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  return Response.json({
    message: 'Daily digest complete',
    sent: sentCount,
    skipped: skipCount,
    errors: errors.length > 0 ? errors : undefined,
  });
}

/**
 * For each common US timezone, determine what hour it currently is.
 * Returns a map of timezone -> current hour (0-23).
 */
function getTimezoneHourMap(now: Date): Map<string, number> {
  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
  ];

  const map = new Map<string, number>();
  for (const tz of timezones) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        hour12: false,
      });
      const parts = formatter.formatToParts(now);
      const hourPart = parts.find((p) => p.type === 'hour');
      if (hourPart) {
        // Intl hour12:false returns 0-23, but midnight may show as "24" in some locales
        const h = parseInt(hourPart.value, 10);
        map.set(tz, h === 24 ? 0 : h);
      }
    } catch {
      // Skip invalid timezone
    }
  }
  return map;
}
