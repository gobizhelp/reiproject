export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import SavedListingsView from "@/components/saved-listings-view";

export default async function SavedListingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch saved listings with full property + photo data
  const { data: savedListings } = await supabase
    .from("saved_listings")
    .select("id, property_id, created_at, properties(*, property_photos(id, url, display_order))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch sent messages so we know which actions were already taken
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
      <SavedListingsView
        savedListings={(savedListings || []) as any}
        sentMessages={sentMessageMap}
      />
    </div>
  );
}
