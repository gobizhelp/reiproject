import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const { adminSupabase } = await requireAdmin();

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      profilesRes,
      propertiesRes,
      messagesRes,
      submissionsRes,
      newUsers7Res,
      newUsers30Res,
      newProps7Res,
      newProps30Res,
    ] = await Promise.all([
      adminSupabase.from('profiles').select('user_role, is_suspended'),
      adminSupabase.from('properties').select('status, is_featured, moderation_status'),
      adminSupabase.from('listing_messages').select('is_read'),
      adminSupabase.from('buy_box_submissions').select('id', { count: 'exact', head: true }),
      adminSupabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
      adminSupabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
      adminSupabase.from('properties').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
      adminSupabase.from('properties').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
    ]);

    const profiles = profilesRes.data || [];
    const properties = propertiesRes.data || [];
    const messages = messagesRes.data || [];

    const metrics = {
      totalUsers: profiles.length,
      totalSellers: profiles.filter((p) => p.user_role === 'seller').length,
      totalBuyers: profiles.filter((p) => p.user_role === 'buyer').length,
      totalBothUsers: profiles.filter((p) => p.user_role === 'both').length,
      suspendedUsers: profiles.filter((p) => p.is_suspended).length,
      totalProperties: properties.length,
      publishedProperties: properties.filter((p) => p.status === 'published').length,
      draftProperties: properties.filter((p) => p.status === 'draft').length,
      featuredProperties: properties.filter((p) => p.is_featured).length,
      flaggedProperties: properties.filter((p) => p.moderation_status === 'flagged').length,
      totalMessages: messages.length,
      unreadMessages: messages.filter((m) => !m.is_read).length,
      totalBuyBoxSubmissions: submissionsRes.count || 0,
      newUsersLast7Days: newUsers7Res.count || 0,
      newUsersLast30Days: newUsers30Res.count || 0,
      newPropertiesLast7Days: newProps7Res.count || 0,
      newPropertiesLast30Days: newProps30Res.count || 0,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
