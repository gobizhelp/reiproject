import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET: Fetch current user's email digest settings
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('email_digest_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Return defaults if no settings exist yet
  return Response.json({
    settings: data || {
      enabled: false,
      send_hour: 8,
      timezone: 'America/New_York',
    },
  });
}

// PUT: Create or update email digest settings
export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { enabled, send_hour, timezone } = body;

  if (typeof enabled !== 'boolean') {
    return Response.json({ error: 'enabled must be a boolean' }, { status: 400 });
  }
  if (typeof send_hour !== 'number' || send_hour < 0 || send_hour > 23) {
    return Response.json({ error: 'send_hour must be 0-23' }, { status: 400 });
  }
  if (typeof timezone !== 'string' || !timezone) {
    return Response.json({ error: 'timezone is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('email_digest_settings')
    .upsert(
      {
        user_id: user.id,
        enabled,
        send_hour,
        timezone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ settings: data });
}
