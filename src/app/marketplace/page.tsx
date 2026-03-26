export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import MarketplaceView from "@/components/marketplace-view";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user profile for tier gating
  const { data: profile } = await supabase
    .from("profiles")
    .select("buyer_tier")
    .eq("id", user.id)
    .single();

  const buyerTier = profile?.buyer_tier ?? "free";

  // Fetch user's saved searches (Pro+ feature)
  const { data: savedSearches } = await supabase
    .from("saved_searches")
    .select("id, name, filters, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

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

  const savedPropertyIds = (savedData as any[] || []).map((s: any) => s.property_id as string);

  // Fetch user's sent messages to know which properties they already messaged about
  const { data: sentMessages } = await supabase
    .from("listing_messages")
    .select("property_id, message_type")
    .eq("sender_id", user.id);

  const sentMessageMap: Record<string, string[]> = {};
  (sentMessages as any[] || []).forEach((m: any) => {
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
        buyerTier={buyerTier}
        initialSavedSearches={savedSearches || []}
      />
    </div>
  );
}
