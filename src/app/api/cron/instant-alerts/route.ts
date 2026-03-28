import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendAlertsForTier } from '@/app/api/instant-alerts/notify/route';
import type { Property } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * GET /api/cron/instant-alerts
 *
 * Runs every 15 minutes via Vercel Cron. Finds pending Pro tier instant alerts
 * whose scheduled_for time has passed (i.e. the Elite early access window has
 * expired) and sends them.
 *
 * Requires CRON_SECRET header for authentication.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // Find all pending Pro alerts whose scheduled time has passed
  const { data: pendingAlerts, error: alertError } = await supabase
    .from('instant_alert_log')
    .select('id, property_id')
    .eq('status', 'pending')
    .eq('tier', 'pro')
    .lte('scheduled_for', now);

  if (alertError) {
    return Response.json({ error: alertError.message }, { status: 500 });
  }

  if (!pendingAlerts || pendingAlerts.length === 0) {
    return Response.json({ message: 'No pending alerts', sent: 0 });
  }

  let totalSent = 0;
  const errors: string[] = [];

  for (const alert of pendingAlerts) {
    // Fetch the property with photos
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*, property_photos(id, url, display_order)')
      .eq('id', alert.property_id)
      .eq('status', 'published')
      .in('seller_status', ['active', 'pending'])
      .single();

    if (propError || !property) {
      // Property no longer published — mark alert as failed
      await supabase
        .from('instant_alert_log')
        .update({
          status: 'failed',
          error_message: 'Property no longer published or active',
          sent_at: now,
        })
        .eq('id', alert.id);
      continue;
    }

    const typedProperty = property as Property & {
      property_photos: { id: string; url: string; display_order: number }[];
    };

    const result = await sendAlertsForTier(supabase, typedProperty, 'pro', false);

    await supabase
      .from('instant_alert_log')
      .update({
        status: result.errors.length === 0 ? 'sent' : (result.sent > 0 ? 'sent' : 'failed'),
        sent_at: now,
        recipients_count: result.sent,
        error_message: result.errors.length > 0 ? result.errors.join('; ') : null,
      })
      .eq('id', alert.id);

    totalSent += result.sent;
    errors.push(...result.errors);
  }

  return Response.json({
    message: 'Instant alerts processed',
    alerts_processed: pendingAlerts.length,
    emails_sent: totalSent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
