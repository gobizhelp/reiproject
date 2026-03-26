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

  // Seller: fetch received messages with property + sender info
  const { data: messages } = await supabase
    .from("listing_messages")
    .select("*, properties(id, slug, street_address, city, state, zip_code, asking_price, property_type, beds, baths, sqft, property_photos(id, url, display_order)), sender:profiles!listing_messages_sender_id_fkey(full_name, company_name, phone)")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MessagesView messages={(messages || []) as any} role="seller" />
    </div>
  );
}
