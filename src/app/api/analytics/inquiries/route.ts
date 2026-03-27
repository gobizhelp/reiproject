import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest } from "next/server";
import { profileHasSellerFeature } from "@/lib/membership/feature-gate";
import type { Profile } from "@/lib/profile-types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const typedProfile = profile as Profile;
  if (!profileHasSellerFeature(typedProfile, "inquiries_analytics")) {
    return Response.json(
      { error: "Upgrade to Pro to access inquiries analytics" },
      { status: 403 }
    );
  }

  const days = parseInt(request.nextUrl.searchParams.get("days") || "30");
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Fetch seller's properties
  const { data: properties } = await supabase
    .from("properties")
    .select("id, street_address, city, state, slug, status, asking_price, property_photos(id, url, display_order)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!properties || properties.length === 0) {
    return Response.json({ properties: [], totals: { total: 0, byType: {}, byDay: [] }, days });
  }

  const propertyIds = properties.map((p: { id: string }) => p.id);

  // Use admin client to fetch all conversations for these properties (across all buyers)
  const adminClient = createAdminClient();

  const { data: conversations } = await adminClient
    .from("conversations")
    .select("id, property_id, initial_action, inquiry_status, created_at")
    .in("property_id", propertyIds)
    .eq("seller_id", user.id);

  // Also fetch legacy listing_messages for completeness
  const { data: listingMessages } = await adminClient
    .from("listing_messages")
    .select("id, property_id, message_type, created_at")
    .in("property_id", propertyIds)
    .eq("recipient_id", user.id);

  // Aggregate per-property inquiry counts
  const inquiryCounts: Record<string, { total: number; byType: Record<string, number>; byStatus: Record<string, number> }> = {};
  for (const id of propertyIds) {
    inquiryCounts[id] = { total: 0, byType: {}, byStatus: {} };
  }

  // Count from conversations (preferred)
  const allInquiryDates: string[] = [];
  if (conversations) {
    for (const conv of conversations) {
      const pid = conv.property_id as string;
      if (!inquiryCounts[pid]) continue;
      inquiryCounts[pid].total++;
      const action = conv.initial_action as string;
      inquiryCounts[pid].byType[action] = (inquiryCounts[pid].byType[action] || 0) + 1;
      const status = (conv.inquiry_status as string) || "new";
      inquiryCounts[pid].byStatus[status] = (inquiryCounts[pid].byStatus[status] || 0) + 1;
      allInquiryDates.push(conv.created_at as string);
    }
  }

  // If no conversations, fall back to listing_messages
  if (!conversations || conversations.length === 0) {
    if (listingMessages) {
      for (const msg of listingMessages) {
        const pid = msg.property_id as string;
        if (!inquiryCounts[pid]) continue;
        inquiryCounts[pid].total++;
        const type = msg.message_type as string;
        inquiryCounts[pid].byType[type] = (inquiryCounts[pid].byType[type] || 0) + 1;
        inquiryCounts[pid].byStatus["new"] = (inquiryCounts[pid].byStatus["new"] || 0) + 1;
        allInquiryDates.push(msg.created_at as string);
      }
    }
  }

  // Build daily volume within date range
  const byDay: Record<string, number> = {};
  for (const dateStr of allInquiryDates) {
    const d = new Date(dateStr);
    if (d >= since) {
      const dayKey = d.toISOString().split("T")[0];
      byDay[dayKey] = (byDay[dayKey] || 0) + 1;
    }
  }

  // Sort daily data
  const sortedDays = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Build response
  const propertyData = properties.map((prop: any) => ({
    id: prop.id,
    street_address: prop.street_address,
    city: prop.city,
    state: prop.state,
    slug: prop.slug,
    status: prop.status,
    asking_price: prop.asking_price,
    thumbnail: prop.property_photos
      ?.sort((a: any, b: any) => a.display_order - b.display_order)[0]?.url || null,
    inquiries: inquiryCounts[prop.id]?.total || 0,
    byType: inquiryCounts[prop.id]?.byType || {},
    byStatus: inquiryCounts[prop.id]?.byStatus || {},
  }));

  // Global totals
  const totalInquiries = propertyData.reduce((sum: number, p: any) => sum + p.inquiries, 0);
  const globalByType: Record<string, number> = {};
  const globalByStatus: Record<string, number> = {};
  for (const p of propertyData) {
    for (const [type, count] of Object.entries(p.byType)) {
      globalByType[type] = (globalByType[type] || 0) + (count as number);
    }
    for (const [status, count] of Object.entries(p.byStatus)) {
      globalByStatus[status] = (globalByStatus[status] || 0) + (count as number);
    }
  }

  return Response.json({
    properties: propertyData,
    totals: {
      total: totalInquiries,
      byType: globalByType,
      byStatus: globalByStatus,
      byDay: sortedDays,
    },
    days,
  });
}
