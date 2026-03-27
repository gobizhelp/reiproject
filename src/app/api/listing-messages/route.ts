import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const VALID_TYPES = ["request_showing", "make_offer", "ask_question"] as const;

const DEFAULT_MESSAGES: Record<string, string> = {
  request_showing:
    "Hi, I'd like to schedule a showing for this property. Please let me know available times!",
  make_offer:
    "Hi, I'd like to make an offer on this property. Please reach out so we can discuss terms.",
  ask_question: "",
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
      .select("*, properties(id, slug, street_address, city, state, zip_code, asking_price, property_type, beds, baths, sqft, property_photos(id, url, display_order))")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Fetch sender profiles separately (profiles RLS + indirect FK prevents embedded join)
    const senderIds = [...new Set((data || []).map((m: any) => m.sender_id))];
    let profileMap: Record<string, any> = {};
    if (senderIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, company_name, phone")
        .in("id", senderIds);
      (profiles || []).forEach((p: any) => {
        profileMap[p.id] = { full_name: p.full_name, company_name: p.company_name, phone: p.phone };
      });
    }

    const messages = (data || []).map((m: any) => ({
      ...m,
      sender: profileMap[m.sender_id] || null,
    }));

    return Response.json({ messages });
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

// POST: Send a message (request_showing / make_offer / ask_question)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { propertyId, messageType, customMessage } = body;

  if (!propertyId || !messageType) {
    return Response.json({ error: "propertyId and messageType are required" }, { status: 400 });
  }

  if (!VALID_TYPES.includes(messageType)) {
    return Response.json({ error: "Invalid messageType" }, { status: 400 });
  }

  if (messageType === "ask_question" && (!customMessage || !customMessage.trim())) {
    return Response.json({ error: "A message is required for questions" }, { status: 400 });
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

  const message = customMessage?.trim()
    ? customMessage.trim()
    : DEFAULT_MESSAGES[messageType];

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

  // Also create/update a conversation so this appears in the DM system
  try {
    const { data: existingConv, error: convQueryErr } = await supabase
      .from("conversations")
      .select("id")
      .eq("buyer_id", user.id)
      .eq("property_id", propertyId)
      .maybeSingle();

    if (convQueryErr) {
      console.error("Conversation query error:", convQueryErr.message);
    }

    let conversationId: string | null = null;

    if (existingConv) {
      conversationId = existingConv.id;
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    } else if (!convQueryErr) {
      const { data: newConv, error: convInsertErr } = await supabase
        .from("conversations")
        .insert({
          property_id: propertyId,
          buyer_id: user.id,
          seller_id: property.user_id,
          initial_action: messageType,
          buyer_shared_contact: false,
        })
        .select("id")
        .single();

      if (convInsertErr) {
        console.error("Conversation insert error:", convInsertErr.message);
      }
      if (newConv) conversationId = newConv.id;
    }

    if (conversationId) {
      const { error: msgInsertErr } = await supabase
        .from("conversation_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          message,
        });

      if (msgInsertErr) {
        console.error("Conversation message insert error:", msgInsertErr.message);
      }
    }
  } catch (e) {
    console.error("Conversation bridge error:", e);
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
