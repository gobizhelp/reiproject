import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const { adminSupabase } = await requireAdmin();

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await adminSupabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    // Fetch auth users for emails
    const { data: authData, error: authError } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const emailMap = new Map(authData.users.map((u) => [u.id, u.email]));

    // Fetch property counts per user
    const { data: propertyCounts } = await adminSupabase
      .from('properties')
      .select('user_id');

    const propCountMap = new Map<string, number>();
    (propertyCounts || []).forEach((p) => {
      propCountMap.set(p.user_id, (propCountMap.get(p.user_id) || 0) + 1);
    });

    // Fetch message counts per user (as sender)
    const { data: messageCounts } = await adminSupabase
      .from('listing_messages')
      .select('sender_id');

    const msgCountMap = new Map<string, number>();
    (messageCounts || []).forEach((m) => {
      msgCountMap.set(m.sender_id, (msgCountMap.get(m.sender_id) || 0) + 1);
    });

    const users = (profiles || []).map((p) => ({
      id: p.id,
      email: emailMap.get(p.id) || '',
      user_role: p.user_role,
      active_view: p.active_view,
      full_name: p.full_name,
      company_name: p.company_name,
      phone: p.phone,
      is_admin: p.is_admin || false,
      is_suspended: p.is_suspended || false,
      suspended_reason: p.suspended_reason,
      created_at: p.created_at,
      property_count: propCountMap.get(p.id) || 0,
      message_count: msgCountMap.get(p.id) || 0,
    }));

    return NextResponse.json(users);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, adminSupabase } = await requireAdmin();
    const body = await request.json();
    const { userId, action, ...data } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId and action required' }, { status: 400 });
    }

    let updateData: Record<string, unknown> = {};
    let logAction = action;
    const details: Record<string, unknown> = {};

    switch (action) {
      case 'update_role':
        if (!['seller', 'buyer', 'both'].includes(data.user_role)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }
        updateData = { user_role: data.user_role };
        details.new_role = data.user_role;
        break;

      case 'toggle_admin':
        updateData = { is_admin: data.is_admin };
        details.is_admin = data.is_admin;
        break;

      case 'suspend':
        updateData = {
          is_suspended: true,
          suspended_at: new Date().toISOString(),
          suspended_reason: data.reason || null,
        };
        details.reason = data.reason;
        break;

      case 'activate':
        updateData = {
          is_suspended: false,
          suspended_at: null,
          suspended_reason: null,
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log the action
    await adminSupabase.from('admin_activity_log').insert({
      admin_id: user.id,
      action: logAction,
      target_type: 'user',
      target_id: userId,
      details,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
