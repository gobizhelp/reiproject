import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { hasBuyerFeature, getBuyerLimit } from "@/lib/membership/feature-gate";
import type { Tier } from "@/lib/membership/tier-config";

export const dynamic = "force-dynamic";

async function getUserAndTier(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("buyer_tier")
    .eq("id", user.id)
    .single();

  const tier = (profile?.buyer_tier ?? "free") as Tier;
  return { user, tier };
}

// GET: Fetch all saved searches for the current user
export async function GET() {
  const supabase = await createClient();
  const result = await getUserAndTier(supabase);

  if (!result) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasBuyerFeature(result.tier, "saved_searches")) {
    return Response.json({ error: "Upgrade to Pro to use saved searches" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, name, filters, created_at, updated_at")
    .eq("user_id", result.user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ savedSearches: data });
}

// POST: Create a new saved search
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const result = await getUserAndTier(supabase);

  if (!result) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasBuyerFeature(result.tier, "saved_searches")) {
    return Response.json({ error: "Upgrade to Pro to use saved searches" }, { status: 403 });
  }

  const body = await request.json();
  const { name, filters } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  if (!filters || typeof filters !== "object") {
    return Response.json({ error: "Filters are required" }, { status: 400 });
  }

  // Check limit
  const maxSearches = getBuyerLimit(result.tier, "max_saved_searches");
  const { count } = await supabase
    .from("saved_searches")
    .select("id", { count: "exact", head: true })
    .eq("user_id", result.user.id);

  if ((count ?? 0) >= maxSearches) {
    return Response.json(
      { error: `You can save up to ${maxSearches} searches on your current plan` },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("saved_searches")
    .insert({
      user_id: result.user.id,
      name: name.trim(),
      filters,
    })
    .select("id, name, filters, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return Response.json({ error: "A saved search with this name already exists" }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ savedSearch: data }, { status: 201 });
}

// PATCH: Update an existing saved search
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const result = await getUserAndTier(supabase);

  if (!result) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, filters } = body;

  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name && typeof name === "string") updates.name = name.trim();
  if (filters && typeof filters === "object") updates.filters = filters;

  const { data, error } = await supabase
    .from("saved_searches")
    .update(updates)
    .eq("id", id)
    .eq("user_id", result.user.id)
    .select("id, name, filters, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return Response.json({ error: "A saved search with this name already exists" }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ savedSearch: data });
}

// DELETE: Remove a saved search
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const result = await getUserAndTier(supabase);

  if (!result) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return Response.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("saved_searches")
    .delete()
    .eq("id", id)
    .eq("user_id", result.user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: "Deleted" });
}
