import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';

// POST: Start impersonating a user
export async function POST(request: NextRequest) {
  try {
    const { user: adminUser } = await requireAdmin();
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Verify the target user exists and is a demo account
    const { data: targetProfile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('id, full_name, user_role, active_view')
      .eq('id', userId)
      .single();

    if (profileError || !targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get target user's email to verify it's a demo account
    const { data: authData } = await adminSupabase.auth.admin.getUserById(userId);
    if (!authData?.user?.email?.endsWith('@reireach.test')) {
      return NextResponse.json(
        { error: 'Can only impersonate demo accounts (@reireach.test)' },
        { status: 403 }
      );
    }

    // Generate a magic link for the target user
    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'magiclink',
      email: authData.user.email,
    });

    if (linkError || !linkData) {
      return NextResponse.json(
        { error: linkError?.message || 'Failed to generate impersonation link' },
        { status: 500 }
      );
    }

    // Log the impersonation
    await adminSupabase.from('admin_activity_log').insert({
      admin_id: adminUser.id,
      action: 'impersonate_user',
      target_type: 'user',
      target_id: userId,
      details: {
        target_email: authData.user.email,
        target_name: targetProfile.full_name,
      },
    });

    // Return the token hashed properties so the client can exchange them
    // The magic link contains a token that can be used to create a session
    const url = new URL(linkData.properties.action_link);
    const token_hash = url.searchParams.get('token_hash') || url.hash;
    const type = url.searchParams.get('type') || 'magiclink';

    return NextResponse.json({
      success: true,
      token_hash: linkData.properties.hashed_token,
      verification_type: type,
      target: {
        id: targetProfile.id,
        name: targetProfile.full_name,
        role: targetProfile.user_role,
        email: authData.user.email,
      },
    });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : error.message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
