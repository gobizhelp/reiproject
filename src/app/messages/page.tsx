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

  // Fetch conversations where user is buyer or seller
  const { data: conversations } = await supabase
    .from("conversations")
    .select("*, properties(id, slug, street_address, city, state, zip_code, asking_price, property_photos(id, url, display_order))")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  // Fetch profiles for the other party
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

  // Enrich conversations with last message, unread count, and other user info
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

    return {
      ...conv,
      other_user: {
        id: otherUserId,
        full_name: otherProfile?.full_name || "Unknown",
        ...(conv.buyer_shared_contact ? { company_name: otherProfile?.company_name, phone: otherProfile?.phone } : {}),
      },
      last_message: lastMsg,
      unread_count: unreadCount || 0,
      is_buyer: conv.buyer_id === user.id,
    };
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ConversationsList
        conversations={enriched as any}
        role={isBuyer ? "buyer" : "seller"}
      />
    </div>
  );
}
