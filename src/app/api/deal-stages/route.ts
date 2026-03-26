import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import type { DealStage } from "@/lib/types";

export const dynamic = "force-dynamic";

const VALID_STAGES: DealStage[] = ["saved", "reviewing", "contacted", "passed"];

// GET: Fetch all deal stages for the current user (with property data)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("deal_stages")
    .select("*, properties(*, property_photos(id, url, display_order))")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ dealStages: data });
}

// POST: Add a property to the pipeline (default stage: "saved")
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { propertyId, stage = "saved" } = body;

  if (!propertyId) {
    return Response.json({ error: "propertyId is required" }, { status: 400 });
  }

  if (!VALID_STAGES.includes(stage)) {
    return Response.json({ error: "Invalid stage" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("deal_stages")
    .insert({ user_id: user.id, property_id: propertyId, stage })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return Response.json({ error: "Property already in pipeline" }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ dealStage: data });
}

// PATCH: Update stage or notes for a deal
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { propertyId, stage, notes } = body;

  if (!propertyId) {
    return Response.json({ error: "propertyId is required" }, { status: 400 });
  }

  const updates: Record<string, string> = {};

  if (stage !== undefined) {
    if (!VALID_STAGES.includes(stage)) {
      return Response.json({ error: "Invalid stage" }, { status: 400 });
    }
    updates.stage = stage;
  }

  if (notes !== undefined) {
    updates.notes = notes;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No updates provided" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("deal_stages")
    .update(updates)
    .eq("user_id", user.id)
    .eq("property_id", propertyId)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ dealStage: data });
}

// DELETE: Remove a property from the pipeline
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
    .from("deal_stages")
    .delete()
    .eq("user_id", user.id)
    .eq("property_id", propertyId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: "Removed from pipeline" });
}
