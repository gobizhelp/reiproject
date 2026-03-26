import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Tier } from '@/lib/membership/tier-config';

const VALID_TIERS: Tier[] = ['free', 'pro', 'elite'];

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('buyer_tier, seller_tier, user_role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({
      buyer_tier: profile.buyer_tier ?? 'free',
      seller_tier: profile.seller_tier ?? 'free',
      user_role: profile.user_role,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan_type, new_tier } = body as { plan_type?: string; new_tier?: string };

    if (!plan_type || !new_tier) {
      return NextResponse.json({ error: 'plan_type and new_tier are required' }, { status: 400 });
    }

    if (!['buyer', 'seller'].includes(plan_type)) {
      return NextResponse.json({ error: 'plan_type must be buyer or seller' }, { status: 400 });
    }

    if (!VALID_TIERS.includes(new_tier as Tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const column = plan_type === 'buyer' ? 'buyer_tier' : 'seller_tier';

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ [column]: new_tier })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, [column]: new_tier });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
