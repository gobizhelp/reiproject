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

  // Check seller tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const typedProfile = profile as Profile;
  if (!profileHasSellerFeature(typedProfile, "listing_analytics")) {
    return Response.json(
      { error: "Upgrade to Pro to access analytics" },
      { status: 403 }
    );
  }

  // Optional date range filter
  const days = parseInt(request.nextUrl.searchParams.get("days") || "30");
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Fetch seller's properties
  const { data: properties } = await supabase
    .from("properties")
    .select("id, street_address, city, state, slug, status, seller_status, asking_price, property_photos(id, url, display_order)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!properties || properties.length === 0) {
    return Response.json({ properties: [] });
  }

  const propertyIds = properties.map((p: { id: string }) => p.id);

  // Fetch aggregated events per property
  const { data: events } = await supabase
    .from("property_events")
    .select("property_id, event_type")
    .in("property_id", propertyIds)
    .gte("created_at", since.toISOString());

  // Use admin client for cross-user queries (saves by other users, all buy boxes)
  const adminClient = createAdminClient();

  // Fetch saves count per property (other users' saves, bypasses RLS)
  const { data: saves } = await adminClient
    .from("saved_listings")
    .select("property_id")
    .in("property_id", propertyIds);

  // Fetch buy box matches per property (all buyers' buy boxes)
  const { data: buyBoxes } = await adminClient
    .from("buyer_buy_boxes")
    .select("*");

  // Aggregate events
  const eventCounts: Record<string, { impressions: number; clicks: number; views: number }> = {};
  for (const id of propertyIds) {
    eventCounts[id] = { impressions: 0, clicks: 0, views: 0 };
  }
  if (events) {
    for (const e of events) {
      const pid = e.property_id as string;
      const type = e.event_type as string;
      if (!eventCounts[pid]) continue;
      if (type === "impression") eventCounts[pid].impressions++;
      else if (type === "click") eventCounts[pid].clicks++;
      else if (type === "view") eventCounts[pid].views++;
    }
  }

  // Aggregate saves
  const saveCounts: Record<string, number> = {};
  if (saves) {
    for (const s of saves) {
      const pid = s.property_id as string;
      saveCounts[pid] = (saveCounts[pid] || 0) + 1;
    }
  }

  // Calculate buy box matches per property
  const matchCounts: Record<string, number> = {};
  if (buyBoxes) {
    for (const prop of properties) {
      let matches = 0;
      for (const box of buyBoxes) {
        let isMatch = true;

        // Match on property type
        if (box.property_types?.length > 0 && prop.asking_price !== undefined) {
          // Property type matching would need the property_type field
        }

        // Match on price range
        if (box.min_price && prop.asking_price && prop.asking_price < box.min_price) {
          isMatch = false;
        }
        if (box.max_price && prop.asking_price && prop.asking_price > box.max_price) {
          isMatch = false;
        }

        // Match on location (city/state in locations string)
        if (box.locations) {
          const loc = box.locations.toLowerCase();
          const propCity = (prop.city || "").toLowerCase();
          const propState = (prop.state || "").toLowerCase();
          if (!loc.includes(propCity) && !loc.includes(propState)) {
            isMatch = false;
          }
        }

        if (isMatch) matches++;
      }
      matchCounts[prop.id] = matches;
    }
  }

  // Build response
  const analyticsData = properties.map((prop: any) => ({
    id: prop.id,
    street_address: prop.street_address,
    city: prop.city,
    state: prop.state,
    slug: prop.slug,
    status: prop.status,
    seller_status: prop.seller_status,
    asking_price: prop.asking_price,
    thumbnail: prop.property_photos
      ?.sort((a: any, b: any) => a.display_order - b.display_order)[0]?.url || null,
    impressions: eventCounts[prop.id]?.impressions || 0,
    clicks: eventCounts[prop.id]?.clicks || 0,
    views: eventCounts[prop.id]?.views || 0,
    saves: saveCounts[prop.id] || 0,
    buyBoxMatches: matchCounts[prop.id] || 0,
  }));

  // Totals
  const totals = analyticsData.reduce(
    (acc: any, p: any) => ({
      impressions: acc.impressions + p.impressions,
      clicks: acc.clicks + p.clicks,
      views: acc.views + p.views,
      saves: acc.saves + p.saves,
      buyBoxMatches: acc.buyBoxMatches + p.buyBoxMatches,
    }),
    { impressions: 0, clicks: 0, views: 0, saves: 0, buyBoxMatches: 0 }
  );

  return Response.json({ properties: analyticsData, totals, days });
}
