export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import SavedListingsView from "@/components/saved-listings-view";
import { profileHasBuyerFeature } from "@/lib/membership/feature-gate";
import type { Profile } from "@/lib/profile-types";

export default async function SavedListingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch saved listings, sent messages, profile, and buyer notes in parallel
  const [savedRes, sentRes, profileRes, notesRes] = await Promise.all([
    supabase
      .from("saved_listings")
      .select("id, property_id, created_at, properties(*, property_photos(id, url, display_order))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("listing_messages")
      .select("property_id, message_type")
      .eq("sender_id", user.id),
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
    supabase
      .from("buyer_notes")
      .select("property_id, content")
      .eq("user_id", user.id),
  ]);

  const sentMessageMap: Record<string, string[]> = {};
  (sentRes.data as any[] || []).forEach((m: any) => {
    if (!sentMessageMap[m.property_id]) sentMessageMap[m.property_id] = [];
    sentMessageMap[m.property_id].push(m.message_type);
  });

  const notesMap: Record<string, string> = {};
  (notesRes.data as any[] || []).forEach((n: any) => {
    notesMap[n.property_id] = n.content;
  });

  const profile = profileRes.data as Profile | null;
  const hasNotesFeature = profile ? profileHasBuyerFeature(profile, "private_notes") : false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SavedListingsView
        savedListings={(savedRes.data || []) as any}
        sentMessages={sentMessageMap}
        notesMap={notesMap}
        hasNotesFeature={hasNotesFeature}
      />
    </div>
  );
}
