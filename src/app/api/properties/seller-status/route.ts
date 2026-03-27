import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const VALID_STATUSES = ["active", "pending", "sold", "archived"] as const;

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { property_id, seller_status } = body;

  if (!property_id || !seller_status) {
    return NextResponse.json({ error: "Missing property_id or seller_status" }, { status: 400 });
  }

  if (!VALID_STATUSES.includes(seller_status)) {
    return NextResponse.json({ error: "Invalid seller_status" }, { status: 400 });
  }

  // RLS ensures only the owner can update their own properties
  const { data, error } = await supabase
    .from("properties")
    .update({ seller_status, updated_at: new Date().toISOString() })
    .eq("id", property_id)
    .eq("user_id", user.id)
    .select("id, seller_status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
