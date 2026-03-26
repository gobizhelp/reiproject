import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_MESSAGES = {
  interested:
    "Hi, I'm interested in this property and would like to discuss it further. Please let me know the next steps!",
  more_info:
    "Hi, I'd like to request more information about this property. Could you share additional details?",
};

// GET: Fetch messages (for seller: received, for buyer: sent)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = request.nextUrl.searchParams.get("role") || "recipient";

  if (role === "recipient") {
    // Seller view: messages received
    const { data, error } = await supabase
      .from("listing_messages")
      .select("*, properties(id, slug, street_address, city, state, zip_code, asking_price, property_type, beds, baths, sqft, property_photos(id, url, display_order)), sender:profiles!listing_messages_sender_id_fkey(full_name, company_name, phone)")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ messages: data });
  }

  // Buyer view: messages sent
  const { data, error } = await supabase
    .from("listing_messages")
    .select("*, properties(id, slug, street_address, city, state, zip_code, asking_price, property_photos(id, url, display_order))")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ messages: data });
}

// POST: Send a message (interested / more_info)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { propertyId, messageType } = body;

  if (!propertyId || !messageType) {
    return Response.json({ error: "propertyId and messageType are required" }, { status: 400 });
  }

  if (messageType !== "interested" && messageType !== "more_info") {
    return Response.json({ error: "messageType must be 'interested' or 'more_info'" }, { status: 400 });
  }

  // Get the property to find the seller (recipient)
  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("user_id")
    .eq("id", propertyId)
    .eq("status", "published")
    .single();

  if (propError || !property) {
    return Response.json({ error: "Property not found" }, { status: 404 });
  }

  if (property.user_id === user.id) {
    return Response.json({ error: "Cannot message your own property" }, { status: 400 });
  }

  // Check if user already sent this type of message for this property
  const { data: existing } = await supabase
    .from("listing_messages")
    .select("id")
    .eq("sender_id", user.id)
    .eq("property_id", propertyId)
    .eq("message_type", messageType)
    .maybeSingle();

  if (existing) {
    return Response.json({ message: "Already sent" });
  }

  const message = DEFAULT_MESSAGES[messageType as keyof typeof DEFAULT_MESSAGES];

  const { error } = await supabase
    .from("listing_messages")
    .insert({
      sender_id: user.id,
      recipient_id: property.user_id,
      property_id: propertyId,
      message_type: messageType,
      message,
    });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: "Sent" });
}

// PATCH: Mark message as read
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { messageId } = body;

  if (!messageId) {
    return Response.json({ error: "messageId is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("listing_messages")
    .update({ is_read: true })
    .eq("id", messageId)
    .eq("recipient_id", user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: "Marked as read" });
}
