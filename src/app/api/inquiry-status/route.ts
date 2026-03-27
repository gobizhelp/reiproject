import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { profileHasSellerFeature } from "@/lib/membership/feature-gate";
import type { Profile } from "@/lib/profile-types";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["new", "contacted", "negotiating", "closed_won", "closed_lost"] as const;

// GET: Fetch inquiry statuses for seller's conversations
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

  if (!profileHasSellerFeature(profile as Profile, "inquiry_status_tracking")) {
    return Response.json(
      { error: "Upgrade to Pro to track inquiry statuses" },
      { status: 403 }
    );
  }

  const propertyId = request.nextUrl.searchParams.get("propertyId");

  let query = supabase
    .from("conversations")
    .select("id, property_id, buyer_id, initial_action, inquiry_status, inquiry_status_updated_at, buyer_shared_contact, created_at, updated_at, properties(id, slug, street_address, city, state)")
    .eq("seller_id", user.id)
    .order("updated_at", { ascending: false });

  if (propertyId) {
    query = query.eq("property_id", propertyId);
  }

  const { data: conversations, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Fetch buyer profiles
  const buyerIds = [...new Set((conversations || []).map((c: any) => c.buyer_id))];
  let buyerMap: Record<string, any> = {};
  if (buyerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, company_name")
      .in("id", buyerIds);
    (profiles || []).forEach((p: any) => {
      buyerMap[p.id] = p;
    });
  }

  const enriched = (conversations || []).map((conv: any) => ({
    ...conv,
    buyer: buyerMap[conv.buyer_id] || { full_name: "Unknown" },
  }));

  return Response.json({ inquiries: enriched });
}

// PATCH: Update inquiry status
export async function PATCH(request: NextRequest) {
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

  if (!profileHasSellerFeature(profile as Profile, "inquiry_status_tracking")) {
    return Response.json(
      { error: "Upgrade to Pro to track inquiry statuses" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { conversationId, status } = body;

  if (!conversationId || !status) {
    return Response.json({ error: "conversationId and status are required" }, { status: 400 });
  }

  if (!VALID_STATUSES.includes(status)) {
    return Response.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  // Verify seller owns this conversation
  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("seller_id", user.id)
    .single();

  if (!conv) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("conversations")
    .update({
      inquiry_status: status,
      inquiry_status_updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId)
    .eq("seller_id", user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: "Status updated" });
}
