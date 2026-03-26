import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const { adminSupabase } = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Time series data for analytics
    if (type === 'timeseries') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [usersRes, propertiesRes, messagesRes, savedRes] = await Promise.all([
        adminSupabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo),
        adminSupabase
          .from('properties')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo),
        adminSupabase
          .from('listing_messages')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo),
        adminSupabase
          .from('saved_listings')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo),
      ]);

      return NextResponse.json({
        userDates: (usersRes.data || []).map((r) => r.created_at),
        propertyDates: (propertiesRes.data || []).map((r) => r.created_at),
        messageDates: (messagesRes.data || []).map((r) => r.created_at),
        savedDates: (savedRes.data || []).map((r) => r.created_at),
      });
    }

    // Admin activity log
    const { data: logs, error } = await adminSupabase
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get admin names
    const adminIds = [...new Set((logs || []).map((l) => l.admin_id))];
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, full_name')
      .in('id', adminIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name]));

    const result = (logs || []).map((l) => ({
      ...l,
      admin_name: profileMap.get(l.admin_id) || 'Unknown',
    }));

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
