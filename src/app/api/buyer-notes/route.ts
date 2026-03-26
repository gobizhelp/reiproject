import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { hasBuyerFeature } from "@/lib/membership/feature-gate";
import type { Tier } from "@/lib/membership/tier-config";

export const dynamic = "force-dynamic";

// GET: Fetch buyer notes (single property or all)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const propertyId = request.nextUrl.searchParams.get("propertyId");

  if (propertyId) {
    const { data, error } = await supabase
      .from("buyer_notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("property_id", propertyId)
      .maybeSingle();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ note: data });
  }

  // Return all notes for the user (keyed by property_id)
  const { data, error } = await supabase
    .from("buyer_notes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ notes: data });
}

// POST: Create or update a note (upsert)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("buyer_tier")
    .eq("id", user.id)
    .single();

  const buyerTier: Tier = profile?.buyer_tier ?? "free";
  if (!hasBuyerFeature(buyerTier, "private_notes")) {
    return Response.json(
      { error: "Private notes require a Pro or Elite buyer plan" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { propertyId, content } = body;

  if (!propertyId) {
    return Response.json({ error: "propertyId is required" }, { status: 400 });
  }

  if (!content || !content.trim()) {
    return Response.json({ error: "content is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("buyer_notes")
    .upsert(
      {
        user_id: user.id,
        property_id: propertyId,
        content: content.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,property_id" }
    )
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ note: data });
}

// DELETE: Remove a note
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { propertyId } = body;

  if (!propertyId) {
    return Response.json({ error: "propertyId is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("buyer_notes")
    .delete()
    .eq("user_id", user.id)
    .eq("property_id", propertyId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: "Note deleted" });
}
