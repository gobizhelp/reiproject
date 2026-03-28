export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import ConversationsList from "@/components/conversations-list";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get profile to determine view
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_view")
    .eq("id", user.id)
    .single();

  const isBuyer = profile?.active_view === "buyer";

  // Try fetching conversations (new DM system)
  const { data: conversations, error: convError } = await supabase
    .from("conversations")
    .select("*, properties(id, slug, street_address, city, state, zip_code, asking_price, property_photos(id, url, display_order))")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  // If conversations table works and has data, use the new system
  if (!convError && conversations && conversations.length > 0) {
    // Fetch profiles for the other party
    const otherUserIds = [...new Set(conversations.map((c: any) =>
      c.buyer_id === user.id ? c.seller_id : c.buyer_id
    ))];

    let profileMap: Record<string, any> = {};
    if (otherUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, company_name, phone, buyer_tier")
        .in("id", otherUserIds);
      (profiles || []).forEach((p: any) => {
        profileMap[p.id] = p;
      });
    }

    // Enrich conversations with last message, unread count, and other user info
    const enriched = await Promise.all(conversations.map(async (conv: any) => {
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

      return {
        ...conv,
        other_user: {
          id: otherUserId,
          full_name: otherProfile?.full_name || "Unknown",
          buyer_tier: otherProfile?.buyer_tier || "free",
          ...(conv.buyer_shared_contact ? { company_name: otherProfile?.company_name, phone: otherProfile?.phone } : {}),
        },
        last_message: lastMsg,
        unread_count: unreadCount || 0,
        is_buyer: conv.buyer_id === user.id,
      };
    }));

    // For sellers, sort priority inquiries first, then by updated_at
    const sorted = isBuyer
      ? enriched
      : enriched.sort((a, b) => {
          const aPriority = a.is_priority ? 1 : 0;
          const bPriority = b.is_priority ? 1 : 0;
          if (bPriority !== aPriority) return bPriority - aPriority;
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <ConversationsList
          conversations={sorted as any}
          role={isBuyer ? "buyer" : "seller"}
        />
      </div>
    );
  }

  // Fallback: build conversations from listing_messages for backward compatibility
  // This handles the case where conversations table doesn't exist yet or has no data
  const query = isBuyer
    ? supabase
        .from("listing_messages")
        .select("*, properties(id, slug, street_address, city, state, zip_code, asking_price, property_photos(id, url, display_order))")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })
    : supabase
        .from("listing_messages")
        .select("*, properties(id, slug, street_address, city, state, zip_code, asking_price, property_photos(id, url, display_order))")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false });

  const { data: rawMessages } = await query;

  // Fetch profiles for the other party
  const otherIds = [...new Set((rawMessages || []).map((m: any) =>
    isBuyer ? m.recipient_id : m.sender_id
  ))];

  let profileMap: Record<string, any> = {};
  if (otherIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, company_name, phone")
      .in("id", otherIds);
    (profiles || []).forEach((p: any) => {
      profileMap[p.id] = p;
    });
  }

  // Group listing_messages by property+other_user to simulate conversations
  const convGroupMap: Record<string, any> = {};
  (rawMessages || []).forEach((msg: any) => {
    const otherUserId = isBuyer ? msg.recipient_id : msg.sender_id;
    const key = `${msg.property_id}_${otherUserId}`;

    if (!convGroupMap[key]) {
      const otherProfile = profileMap[otherUserId] || null;
      convGroupMap[key] = {
        id: key,
        property_id: msg.property_id,
        buyer_id: isBuyer ? user.id : otherUserId,
        seller_id: isBuyer ? otherUserId : user.id,
        buyer_shared_contact: false,
        initial_action: msg.message_type,
        created_at: msg.created_at,
        updated_at: msg.created_at,
        properties: msg.properties,
        other_user: {
          id: otherUserId,
          full_name: otherProfile?.full_name || "Unknown",
        },
        last_message: {
          message: msg.message,
          sender_id: msg.sender_id,
          created_at: msg.created_at,
        },
        unread_count: !isBuyer && !msg.is_read ? 1 : 0,
        is_buyer: isBuyer,
      };
    } else {
      // Update unread count for seller
      if (!isBuyer && !msg.is_read) {
        convGroupMap[key].unread_count += 1;
      }
    }
  });

  const fallbackConversations = Object.values(convGroupMap);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ConversationsList
        conversations={fallbackConversations as any}
        role={isBuyer ? "buyer" : "seller"}
      />
    </div>
  );
}
