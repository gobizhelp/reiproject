import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const { adminSupabase } = await requireAdmin();

    const { data: messages, error } = await adminSupabase
      .from('listing_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get all unique user IDs (senders + recipients)
    const userIds = [
      ...new Set([
        ...(messages || []).map((m) => m.sender_id),
        ...(messages || []).map((m) => m.recipient_id),
      ]),
    ];

    const { data: profiles } = await adminSupabase
      .from('profiles')
      .select('id, full_name, company_name')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    // Get property info
    const propertyIds = [...new Set((messages || []).map((m) => m.property_id))];
    const { data: properties } = await adminSupabase
      .from('properties')
      .select('id, street_address, city, state')
      .in('id', propertyIds);

    const propertyMap = new Map((properties || []).map((p) => [p.id, p]));

    const result = (messages || []).map((m) => ({
      ...m,
      sender_name: profileMap.get(m.sender_id)?.full_name || 'Unknown',
      recipient_name: profileMap.get(m.recipient_id)?.full_name || 'Unknown',
      property_address: propertyMap.get(m.property_id)
        ? `${propertyMap.get(m.property_id)!.street_address}, ${propertyMap.get(m.property_id)!.city}`
        : 'Unknown',
    }));

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, adminSupabase } = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('id');

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    const { error } = await adminSupabase
      .from('listing_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await adminSupabase.from('admin_activity_log').insert({
      admin_id: user.id,
      action: 'delete_message',
      target_type: 'message',
      target_id: messageId,
      details: {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
