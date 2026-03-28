import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getResend, EMAIL_FROM } from '@/lib/email';
import { matchProperties } from '@/lib/matching';
import { buildInstantAlertHtml } from '@/lib/email-templates/instant-alert';
import type { Property } from '@/lib/types';
import type { BuyerBuyBox } from '@/lib/profile-types';
import type { Tier } from '@/lib/membership/tier-config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/instant-alerts/notify
 *
 * Called when a property is published. Sends instant email alerts to:
 * - Elite buyers: immediately (early access — they see it first)
 * - Pro buyers: queued for after the early access window expires
 *
 * Body: { propertyId: string }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { propertyId } = body;

  if (!propertyId) {
    return Response.json({ error: 'propertyId is required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch the property with photos
  const { data: property, error: propError } = await supabase
    .from('properties')
    .select('*, property_photos(id, url, display_order)')
    .eq('id', propertyId)
    .eq('status', 'published')
    .single();

  if (propError || !property) {
    return Response.json({ error: 'Property not found or not published' }, { status: 404 });
  }

  // Fetch early access hours setting
  const { data: setting } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'elite_early_access_hours')
    .single();

  const earlyAccessHours: number = setting?.value ?? 24;

  // Check if we already have alerts logged for this property
  // Gracefully handle missing table (migration may not have been run yet)
  let existingTiers = new Set<string>();
  let hasTrackingTable = true;
  try {
    const { data: existingLogs, error: logError } = await supabase
      .from('instant_alert_log')
      .select('tier, status')
      .eq('property_id', propertyId);

    if (logError) {
      // Table likely doesn't exist — proceed without dedup tracking
      hasTrackingTable = false;
    } else {
      existingTiers = new Set((existingLogs || []).map((l: { tier: string }) => l.tier));
    }
  } catch {
    hasTrackingTable = false;
  }

  const results: { elite?: { sent: number; errors: string[] }; pro?: { scheduled: boolean } } = {};

  // --- Send to Elite buyers immediately ---
  if (!existingTiers.has('elite')) {
    const eliteResult = await sendAlertsForTier(supabase, property, 'elite', true);
    results.elite = eliteResult;

    // Log the elite alert (best-effort)
    if (hasTrackingTable) {
      try {
        await supabase.from('instant_alert_log').insert({
          property_id: propertyId,
          tier: 'elite',
          status: eliteResult.errors.length === 0 ? 'sent' : (eliteResult.sent > 0 ? 'sent' : 'failed'),
          sent_at: new Date().toISOString(),
          recipients_count: eliteResult.sent,
          error_message: eliteResult.errors.length > 0 ? eliteResult.errors.join('; ') : null,
        });
      } catch { /* best-effort logging */ }
    }
  }

  // --- Schedule Pro buyer alerts for after early access window ---
  if (!existingTiers.has('pro')) {
    const publishedAt = property.published_at
      ? new Date(property.published_at)
      : new Date();
    const scheduledFor = new Date(publishedAt.getTime() + earlyAccessHours * 60 * 60 * 1000);

    // If early access has already expired (e.g. earlyAccessHours is 0), send immediately
    if (scheduledFor.getTime() <= Date.now()) {
      const proResult = await sendAlertsForTier(supabase, property, 'pro', false);
      results.pro = { scheduled: false };

      if (hasTrackingTable) {
        try {
          await supabase.from('instant_alert_log').insert({
            property_id: propertyId,
            tier: 'pro',
            status: proResult.errors.length === 0 ? 'sent' : (proResult.sent > 0 ? 'sent' : 'failed'),
            scheduled_for: scheduledFor.toISOString(),
            sent_at: new Date().toISOString(),
            recipients_count: proResult.sent,
            error_message: proResult.errors.length > 0 ? proResult.errors.join('; ') : null,
          });
        } catch { /* best-effort logging */ }
      }
    } else {
      // Queue for later — the cron job will pick this up
      if (hasTrackingTable) {
        try {
          await supabase.from('instant_alert_log').insert({
            property_id: propertyId,
            tier: 'pro',
            status: 'pending',
            scheduled_for: scheduledFor.toISOString(),
            recipients_count: 0,
          });
        } catch { /* best-effort logging */ }
      }
      results.pro = { scheduled: true };
    }
  }

  return Response.json({ success: true, results });
}

/**
 * Send instant alert emails to all buyers of the given tier whose buy boxes
 * match the property.
 */
export async function sendAlertsForTier(
  supabase: ReturnType<typeof createAdminClient>,
  property: Property & { property_photos: { id: string; url: string; display_order: number }[] },
  tier: 'elite' | 'pro',
  isEarlyAccess: boolean,
): Promise<{ sent: number; errors: string[] }> {
  const resend = getResend();

  // Fetch buyers of this tier (or higher for pro — elite also gets pro features,
  // but elite already got their alert, so we only target exact tier here)
  const tiers: Tier[] = tier === 'pro' ? ['pro'] : ['elite'];

  const { data: buyers, error: buyerError } = await supabase
    .from('profiles')
    .select('id, full_name, buyer_tier')
    .in('buyer_tier', tiers)
    .in('user_role', ['buyer', 'both']);

  if (buyerError || !buyers || buyers.length === 0) {
    return { sent: 0, errors: buyerError ? [buyerError.message] : [] };
  }

  const buyerIds = buyers.map((b: { id: string }) => b.id);

  // Fetch all buy boxes for these buyers
  const { data: allBuyBoxes, error: boxError } = await supabase
    .from('buyer_buy_boxes')
    .select('*')
    .in('user_id', buyerIds);

  if (boxError || !allBuyBoxes || allBuyBoxes.length === 0) {
    return { sent: 0, errors: boxError ? [boxError.message] : [] };
  }

  // Fetch emails from auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    return { sent: 0, errors: [authError.message] };
  }

  const emailMap = new Map<string, string>();
  for (const u of authUsers.users) {
    if (u.email) emailMap.set(u.id, u.email);
  }

  // Group buy boxes by user
  const buyBoxesByUser = new Map<string, BuyerBuyBox[]>();
  for (const box of allBuyBoxes) {
    const existing = buyBoxesByUser.get(box.user_id) || [];
    existing.push(box);
    buyBoxesByUser.set(box.user_id, existing);
  }

  let sent = 0;
  const errors: string[] = [];

  for (const buyer of buyers) {
    const email = emailMap.get(buyer.id);
    const buyBoxes = buyBoxesByUser.get(buyer.id) || [];

    if (!email || buyBoxes.length === 0) continue;

    // Match this single property against the buyer's buy boxes
    const matches = matchProperties([property], buyBoxes);

    if (matches.length === 0) continue;

    const match = matches[0];
    const html = buildInstantAlertHtml(buyer.full_name, match, isEarlyAccess);
    const subject = isEarlyAccess
      ? `Early Access: New listing at ${property.street_address}`
      : `New listing match: ${property.street_address}`;

    try {
      const { error: sendError } = await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject,
        html,
      });

      if (sendError) {
        errors.push(`Failed to send to ${buyer.id}: ${sendError.message}`);
        continue;
      }

      // Create in-app notification too
      await supabase.from('notifications').insert({
        user_id: buyer.id,
        type: 'new_listing_match',
        title: isEarlyAccess ? 'Early Access: New Listing Match' : 'New Listing Match',
        message: `A new listing at ${property.street_address}, ${property.city} matches your buy box.`,
        priority: isEarlyAccess ? 'high' : 'medium',
        property_id: property.id,
        metadata: {
          match_score: match.bestScore,
          is_early_access: isEarlyAccess,
          tier,
        },
      });

      sent++;
    } catch (err) {
      errors.push(`Failed to send to ${buyer.id}: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }

  return { sent, errors };
}
