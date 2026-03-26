import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const VALID_ACTIONS = ["request_showing", "make_offer", "ask_question"] as const;

const DEFAULT_MESSAGES: Record<string, string> = {
  request_showing:
    "Hi, I'd like to schedule a showing for this property. Please let me know available times!",
  make_offer:
    "Hi, I'd like to make an offer on this property. Please reach out so we can discuss terms.",
  ask_question: "",
};

// GET: Fetch user's conversations with latest message preview
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch conversations where user is buyer or seller
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*, properties(id, slug, street_address, city, state, zip_code, asking_price, property_photos(id, url, display_order))")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Fetch profiles for the other party in each conversation
  const otherUserIds = [...new Set((conversations || []).map((c: any) =>
    c.buyer_id === user.id ? c.seller_id : c.buyer_id
  ))];

  let profileMap: Record<string, any> = {};
  if (otherUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, company_name, phone")
      .in("id", otherUserIds);
    (profiles || []).forEach((p: any) => {
      profileMap[p.id] = p;
    });
  }

  // Fetch latest message and unread count for each conversation
  const enriched = await Promise.all((conversations || []).map(async (conv: any) => {
    const { data: lastMsg } = await supabase
      .from("conversation_messages")
      .select("message, sender_id, created_at")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { count: unreadCount } = await supabase
      .from("conversation_messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conv.id)
      .neq("sender_id", user.id)
      .eq("is_read", false);

    const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
    const otherProfile = profileMap[otherUserId] || null;
    const isBuyer = conv.buyer_id === user.id;

    // Only show contact details if buyer has shared
    let contactInfo = null;
    if (conv.buyer_shared_contact && otherProfile) {
      contactInfo = {
        full_name: otherProfile.full_name,
        company_name: otherProfile.company_name,
        phone: otherProfile.phone,
      };
    }

    return {
      ...conv,
      other_user: {
        id: otherUserId,
        full_name: otherProfile?.full_name || "Unknown",
        ...(conv.buyer_shared_contact ? { company_name: otherProfile?.company_name, phone: otherProfile?.phone } : {}),
      },
      last_message: lastMsg,
      unread_count: unreadCount || 0,
      is_buyer: isBuyer,
    };
  }));

  return Response.json({ conversations: enriched });
}

// POST: Start a new conversation (buyer action)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { propertyId, action, customMessage, shareContact } = body;

  if (!propertyId || !action) {
    return Response.json({ error: "propertyId and action are required" }, { status: 400 });
  }

  if (!VALID_ACTIONS.includes(action)) {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }

  if (action === "ask_question" && (!customMessage || !customMessage.trim())) {
    return Response.json({ error: "A message is required for questions" }, { status: 400 });
  }

  // Get the property to find the seller
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

  // Check if conversation already exists for this buyer+property
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("property_id", propertyId)
    .maybeSingle();

  let conversationId: string;

  if (existing) {
    conversationId = existing.id;
    // Update contact sharing if requested
    if (shareContact) {
      await supabase
        .from("conversations")
        .update({ buyer_shared_contact: true, updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    } else {
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    }
  } else {
    // Create new conversation
    const { data: newConv, error: convError } = await supabase
      .from("conversations")
      .insert({
        property_id: propertyId,
        buyer_id: user.id,
        seller_id: property.user_id,
        initial_action: action,
        buyer_shared_contact: shareContact || false,
      })
      .select("id")
      .single();

    if (convError || !newConv) {
      return Response.json({ error: convError?.message || "Failed to create conversation" }, { status: 500 });
    }
    conversationId = newConv.id;
  }

  // Add the initial message
  const message = action === "ask_question"
    ? customMessage.trim()
    : DEFAULT_MESSAGES[action];

  const { error: msgError } = await supabase
    .from("conversation_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      message,
    });

  if (msgError) {
    return Response.json({ error: msgError.message }, { status: 500 });
  }

  return Response.json({ conversationId, message: "Sent" });
}

// PATCH: Update conversation (share contact, mark read)
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { conversationId, action: patchAction } = body;

  if (!conversationId || !patchAction) {
    return Response.json({ error: "conversationId and action are required" }, { status: 400 });
  }

  if (patchAction === "share_contact") {
    // Only the buyer can share their contact
    const { error } = await supabase
      .from("conversations")
      .update({ buyer_shared_contact: true })
      .eq("id", conversationId)
      .eq("buyer_id", user.id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ message: "Contact shared" });
  }

  if (patchAction === "mark_read") {
    // Mark all messages from the other party as read
    const { data: conv } = await supabase
      .from("conversations")
      .select("buyer_id, seller_id")
      .eq("id", conversationId)
      .single();

    if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("conversation_messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id)
      .eq("is_read", false);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ message: "Marked as read" });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}
