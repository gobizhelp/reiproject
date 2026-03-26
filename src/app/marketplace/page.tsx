export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import MarketplaceView from "@/components/marketplace-view";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all published properties with photos
  const { data: properties } = await supabase
    .from("properties")
    .select("*, property_photos(id, url, display_order)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // Fetch user's saved listing property IDs
  const { data: savedData } = await supabase
    .from("saved_listings")
    .select("property_id")
    .eq("user_id", user.id);

  const savedPropertyIds = savedData?.map((s) => s.property_id) || [];

  // Fetch user's sent messages to know which properties they already messaged about
  const { data: sentMessages } = await supabase
    .from("listing_messages")
    .select("property_id, message_type")
    .eq("sender_id", user.id);

  const sentMessageMap: Record<string, string[]> = {};
  sentMessages?.forEach((m) => {
    if (!sentMessageMap[m.property_id]) sentMessageMap[m.property_id] = [];
    sentMessageMap[m.property_id].push(m.message_type);
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MarketplaceView
        properties={properties || []}
        savedPropertyIds={savedPropertyIds}
        sentMessages={sentMessageMap}
        currentUserId={user.id}
      />
    </div>
  );
}
