import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const { adminSupabase } = await requireAdmin();

    // Get all demo auth users
    const { data: authData } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
    const demoAuthUsers = authData?.users?.filter((u: any) =>
      u.email?.endsWith('@dealpacket.test')
    ) || [];

    if (demoAuthUsers.length === 0) {
      return NextResponse.json({ users: [] });
    }

    const demoUserIds = demoAuthUsers.map((u: any) => u.id);

    // Get their profiles (core fields only - tier columns may not exist yet)
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, full_name, user_role')
      .in('id', demoUserIds);

    // Try to fetch tier data separately (may fail if migration hasn't been run)
    let tierMap = new Map<string, { buyer_tier: string; seller_tier: string }>();
    try {
      const { data: tierData } = await adminSupabase
        .from('profiles')
        .select('id, buyer_tier, seller_tier')
        .in('id', demoUserIds);
      if (tierData) {
        tierData.forEach((t: any) => {
          tierMap.set(t.id, { buyer_tier: t.buyer_tier || 'free', seller_tier: t.seller_tier || 'free' });
        });
      }
    } catch {
      // Tier columns don't exist yet - that's fine
    }

    // Merge email from auth with profile data
    const emailMap = new Map(demoAuthUsers.map((u: any) => [u.id, u.email]));
    const users = (profiles || []).map((p: any) => ({
      id: p.id,
      email: emailMap.get(p.id) || '',
      full_name: p.full_name,
      user_role: p.user_role,
      buyer_tier: tierMap.get(p.id)?.buyer_tier || 'free',
      seller_tier: tierMap.get(p.id)?.seller_tier || 'free',
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
