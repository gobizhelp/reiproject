export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import ConversationView from "@/components/conversation-view";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch conversation with property info
  const { data: conv } = await supabase
    .from("conversations")
    .select("*, properties(id, slug, street_address, city, state, zip_code, asking_price, property_photos(id, url, display_order))")
    .eq("id", id)
    .single();

  if (!conv || (conv.buyer_id !== user.id && conv.seller_id !== user.id)) {
    notFound();
  }

  // Fetch messages
  const { data: messages } = await supabase
    .from("conversation_messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  // Fetch other user's profile
  const isBuyer = conv.buyer_id === user.id;
  const otherUserId = isBuyer ? conv.seller_id : conv.buyer_id;

  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("id, full_name, company_name, phone, buyer_tier")
    .eq("id", otherUserId)
    .single();

  const otherUser = {
    id: otherUserId,
    full_name: otherProfile?.full_name || "Unknown",
    buyer_tier: otherProfile?.buyer_tier || "free",
    ...(conv.buyer_shared_contact ? {
      company_name: otherProfile?.company_name,
      phone: otherProfile?.phone,
    } : {}),
  };

  // Mark unread messages as read
  await supabase
    .from("conversation_messages")
    .update({ is_read: true })
    .eq("conversation_id", id)
    .neq("sender_id", user.id)
    .eq("is_read", false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ConversationView
        conversation={{
          id: conv.id,
          buyer_id: conv.buyer_id,
          seller_id: conv.seller_id,
          buyer_shared_contact: conv.buyer_shared_contact,
          initial_action: conv.initial_action,
          property: conv.properties as any,
        }}
        messages={(messages || []) as any}
        isBuyer={isBuyer}
        currentUserId={user.id}
        otherUser={otherUser}
        contactShared={conv.buyer_shared_contact}
      />
    </div>
  );
}
