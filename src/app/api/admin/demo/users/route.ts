import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const { adminSupabase } = await requireAdmin();

    // Get all demo auth users
    const { data: authData } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });
    const demoAuthUsers = authData?.users?.filter((u) =>
      u.email?.endsWith('@dealpacket.test')
    ) || [];

    if (demoAuthUsers.length === 0) {
      return NextResponse.json({ users: [] });
    }

    const demoUserIds = demoAuthUsers.map((u) => u.id);

    // Get their profiles
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, full_name, user_role, buyer_tier, seller_tier')
      .in('id', demoUserIds);

    // Merge email from auth with profile data
    const emailMap = new Map(demoAuthUsers.map((u) => [u.id, u.email]));
    const users = (profiles || []).map((p) => ({
      id: p.id,
      email: emailMap.get(p.id) || '',
      full_name: p.full_name,
      user_role: p.user_role,
      buyer_tier: p.buyer_tier,
      seller_tier: p.seller_tier,
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
