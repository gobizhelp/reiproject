import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getResend, EMAIL_FROM } from '@/lib/email';
import { matchProperties } from '@/lib/matching';
import { buildDailyDigestHtml, buildNoMatchesHtml } from '@/lib/email-templates/daily-digest';
import type { Property } from '@/lib/types';
import type { BuyerBuyBox } from '@/lib/profile-types';

export const dynamic = 'force-dynamic';

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * POST /api/email-digest-settings/send-now
 *
 * Manually triggers a digest email for the current user.
 * Enforces a 24-hour cooldown since the last send (manual or cron).
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check digest settings and cooldown
  const { data: settings, error: settingsError } = await supabase
    .from('email_digest_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (settingsError && settingsError.code !== 'PGRST116') {
    return Response.json({ error: settingsError.message }, { status: 500 });
  }

  if (!settings || !settings.enabled) {
    return Response.json({ error: 'Daily digest is not enabled' }, { status: 400 });
  }

  // Enforce 24-hour cooldown
  if (settings.last_sent_at) {
    const lastSent = new Date(settings.last_sent_at).getTime();
    const now = Date.now();
    if (now - lastSent < COOLDOWN_MS) {
      const nextAvailable = new Date(lastSent + COOLDOWN_MS).toISOString();
      return Response.json(
        { error: 'Digest was already sent in the last 24 hours', next_available_at: nextAvailable },
        { status: 429 }
      );
    }
  }

  // Use admin client to fetch properties (no RLS restrictions on read)
  const adminSupabase = createAdminClient();
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - COOLDOWN_MS).toISOString();

  const { data: recentProperties, error: propsError } = await adminSupabase
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

  // Fetch buyer's buy boxes
  const { data: buyBoxes, error: boxError } = await supabase
    .from('buyer_buy_boxes')
    .select('*')
    .eq('user_id', user.id);

  if (boxError) {
    return Response.json({ error: boxError.message }, { status: 500 });
  }

  if (!buyBoxes || buyBoxes.length === 0) {
    return Response.json({ error: 'No buy boxes configured. Add a buy box to receive matches.' }, { status: 400 });
  }

  // Fetch profile for name
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const name = profile?.full_name ?? null;

  // Match properties
  const matches = matchProperties(properties, buyBoxes as BuyerBuyBox[]);

  const html =
    matches.length > 0
      ? buildDailyDigestHtml(name, matches)
      : buildNoMatchesHtml(name);

  const subject =
    matches.length > 0
      ? `${matches.length} new deal${matches.length === 1 ? '' : 's'} matching your buy box`
      : 'Your daily deal digest — no new matches today';

  // Send email
  const resend = getResend();
  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: user.email!,
      subject,
      html,
    });
  } catch (err) {
    return Response.json(
      { error: `Failed to send email: ${err instanceof Error ? err.message : 'unknown'}` },
      { status: 500 }
    );
  }

  // Update last_sent_at
  await supabase
    .from('email_digest_settings')
    .update({ last_sent_at: now.toISOString() })
    .eq('user_id', user.id);

  return Response.json({
    message: 'Digest sent',
    matches: matches.length,
    last_sent_at: now.toISOString(),
  });
}
