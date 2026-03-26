export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import MessagesView from "@/components/messages-view";

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

  if (isBuyer) {
    // Buyer: fetch sent messages with property info
    const { data: messages } = await supabase
      .from("listing_messages")
      .select("*, properties(id, slug, street_address, city, state, zip_code, asking_price, property_type, beds, baths, sqft, property_photos(id, url, display_order))")
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false });

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <MessagesView messages={(messages || []) as any} role="buyer" />
      </div>
    );
  }

  // Seller: fetch received messages with property info
  const { data: rawMessages } = await supabase
    .from("listing_messages")
    .select("*, properties(id, slug, street_address, city, state, zip_code, asking_price, property_type, beds, baths, sqft, property_photos(id, url, display_order))")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch sender profiles separately (profiles RLS + indirect FK prevents embedded join)
  const senderIds = [...new Set((rawMessages || []).map((m: any) => m.sender_id))];
  let profileMap: Record<string, { full_name: string | null; company_name: string | null; phone: string | null }> = {};
  if (senderIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, company_name, phone")
      .in("id", senderIds);
    (profiles || []).forEach((p: any) => {
      profileMap[p.id] = { full_name: p.full_name, company_name: p.company_name, phone: p.phone };
    });
  }

  const messages = (rawMessages || []).map((m: any) => ({
    ...m,
    sender: profileMap[m.sender_id] || null,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MessagesView messages={(messages || []) as any} role="seller" />
    </div>
  );
}
