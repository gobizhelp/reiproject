import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET: Fetch user's saved listing IDs (or full saved listings with property data)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const full = request.nextUrl.searchParams.get("full") === "true";

  if (full) {
    // Return saved listings with full property + photo data
    const { data, error } = await supabase
      .from("saved_listings")
      .select("id, property_id, created_at, properties(*, property_photos(id, url, display_order))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ savedListings: data });
  }

  // Return just property IDs for quick lookup
  const { data, error } = await supabase
    .from("saved_listings")
    .select("property_id")
    .eq("user_id", user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const propertyIds = data.map((s: { property_id: string }) => s.property_id);
  return Response.json({ propertyIds });
}

// POST: Save a listing
export async function POST(request: NextRequest) {
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
    .from("saved_listings")
    .insert({ user_id: user.id, property_id: propertyId });

  if (error) {
    if (error.code === "23505") {
      return Response.json({ message: "Already saved" });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: "Saved" });
}

// DELETE: Unsave a listing
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
    .from("saved_listings")
    .delete()
    .eq("user_id", user.id)
    .eq("property_id", propertyId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: "Unsaved" });
}
