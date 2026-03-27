import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const body = await request.json();
  const { propertyId, eventType } = body;

  if (!propertyId || !eventType) {
    return Response.json(
      { error: "propertyId and eventType are required" },
      { status: 400 }
    );
  }

  if (!["impression", "click", "view"].includes(eventType)) {
    return Response.json(
      { error: "eventType must be impression, click, or view" },
      { status: 400 }
    );
  }

  // Get user if logged in (optional for impressions)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("property_events").insert({
    property_id: propertyId,
    event_type: eventType,
    user_id: user?.id || null,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
