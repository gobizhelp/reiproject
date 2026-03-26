import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

const SETTINGS_KEY = 'feature_checklist';

export async function GET() {
  try {
    const { adminSupabase } = await requireAdmin();

    const { data, error } = await adminSupabase
      .from('admin_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.value ?? { checked: {}, notes: {}, flagged: {} });
  } catch (err: any) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { adminSupabase, user } = await requireAdmin();
    const body = await req.json();

    const value = {
      checked: body.checked ?? {},
      notes: body.notes ?? {},
      flagged: body.flagged ?? {},
    };

    const { error } = await adminSupabase
      .from('admin_settings')
      .upsert(
        { key: SETTINGS_KEY, value, updated_by: user.id, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const status = err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
