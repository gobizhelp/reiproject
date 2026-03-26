import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// GET: Fetch messages for a conversation
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversationId = request.nextUrl.searchParams.get("conversationId");
  if (!conversationId) {
    return Response.json({ error: "conversationId is required" }, { status: 400 });
  }

  // Verify user is a participant
  const { data: conv } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id, buyer_shared_contact, initial_action, property_id, properties(id, slug, street_address, city, state, zip_code, asking_price, property_photos(id, url, display_order))")
    .eq("id", conversationId)
    .single();

  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  // Fetch messages
  const { data: messages, error } = await supabase
    .from("conversation_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Fetch both participants' profiles
  const participantIds = [conv.buyer_id, conv.seller_id];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, company_name, phone")
    .in("id", participantIds);

  const profileMap: Record<string, any> = {};
  (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });

  const isBuyer = conv.buyer_id === user.id;
  const otherUserId = isBuyer ? conv.seller_id : conv.buyer_id;

  // Build response with contact info based on sharing status
  const myProfile = profileMap[user.id] || null;
  const otherProfile = profileMap[otherUserId] || null;

  return Response.json({
    conversation: {
      id: conv.id,
      buyer_id: conv.buyer_id,
      seller_id: conv.seller_id,
      buyer_shared_contact: conv.buyer_shared_contact,
      initial_action: conv.initial_action,
      property: conv.properties,
    },
    messages: messages || [],
    is_buyer: isBuyer,
    my_profile: myProfile ? { full_name: myProfile.full_name } : null,
    other_user: {
      id: otherUserId,
      full_name: otherProfile?.full_name || "Unknown",
      // Only share contact details if buyer has opted in
      ...(conv.buyer_shared_contact ? {
        company_name: otherProfile?.company_name,
        phone: otherProfile?.phone,
      } : {}),
    },
    // Show my own contact info if I'm the buyer and I've shared
    my_contact_shared: isBuyer ? conv.buyer_shared_contact : conv.buyer_shared_contact,
  });
}

// POST: Send a message in a conversation
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { conversationId, message } = body;

  if (!conversationId || !message?.trim()) {
    return Response.json({ error: "conversationId and message are required" }, { status: 400 });
  }

  // Verify user is a participant
  const { data: conv } = await supabase
    .from("conversations")
    .select("buyer_id, seller_id")
    .eq("id", conversationId)
    .single();

  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  // Insert message
  const { data: newMsg, error } = await supabase
    .from("conversation_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      message: message.trim(),
    })
    .select("*")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Update conversation timestamp
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return Response.json({ message: newMsg });
}
