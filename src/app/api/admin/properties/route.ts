import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const { adminSupabase } = await requireAdmin();

    const { data: properties, error } = await adminSupabase
      .from('properties')
      .select('*, property_photos(url, display_order)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get owner info for each property
    const userIds = [...new Set((properties || []).map((p) => p.user_id))];
    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, full_name, company_name')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const result = (properties || []).map((p) => ({
      ...p,
      owner_name: profileMap.get(p.user_id)?.full_name || 'Unknown',
      owner_company: profileMap.get(p.user_id)?.company_name || null,
      thumbnail: p.property_photos?.sort(
        (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
      )[0]?.url || null,
    }));

    return NextResponse.json(result);
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
    const { propertyId, action, ...data } = body;

    if (!propertyId || !action) {
      return NextResponse.json({ error: 'propertyId and action required' }, { status: 400 });
    }

    let updateData: Record<string, unknown> = {};
    const details: Record<string, unknown> = {};

    switch (action) {
      case 'feature':
        updateData = { is_featured: data.is_featured };
        details.is_featured = data.is_featured;
        break;

      case 'moderate':
        if (!['pending', 'approved', 'rejected', 'flagged'].includes(data.moderation_status)) {
          return NextResponse.json({ error: 'Invalid moderation status' }, { status: 400 });
        }
        updateData = {
          moderation_status: data.moderation_status,
          moderation_note: data.moderation_note || null,
          moderated_at: new Date().toISOString(),
          moderated_by: user.id,
        };
        details.moderation_status = data.moderation_status;
        details.moderation_note = data.moderation_note;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { error: updateError } = await adminSupabase
      .from('properties')
      .update(updateData)
      .eq('id', propertyId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await adminSupabase.from('admin_activity_log').insert({
      admin_id: user.id,
      action: action === 'feature' ? (data.is_featured ? 'feature_property' : 'unfeature_property') : `${data.moderation_status}_property`,
      target_type: 'property',
      target_id: propertyId,
      details,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
