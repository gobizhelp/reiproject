import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const { adminSupabase } = await requireAdmin();

    const { data, error } = await adminSupabase
      .from('admin_settings')
      .select('key, value');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const settings: Record<string, unknown> = {};
    for (const row of data || []) {
      settings[row.key] = row.value;
    }

    return NextResponse.json(settings);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, adminSupabase } = await requireAdmin();
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key and value are required' }, { status: 400 });
    }

    const { error } = await adminSupabase
      .from('admin_settings')
      .upsert(
        { key, value, updated_by: user.id, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log admin activity
    await adminSupabase.from('admin_activity_log').insert({
      admin_id: user.id,
      action: 'update_setting',
      target_type: 'admin_settings',
      target_id: key,
      details: { key, value },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
