export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  // Fetch all published properties with photos
  const { data: properties } = await supabase
    .from("properties")
    .select("*, property_photos(id, url, display_order)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  // Apply early access filtering for non-elite buyers
  let visibleProperties = properties || [];
  if (buyerTier !== "elite") {
    const adminSupabase = createAdminClient();
    const { data: setting } = await adminSupabase
      .from("admin_settings")
      .select("value")
      .eq("key", "elite_early_access_hours")
      .single();

    const earlyAccessHours: number = setting?.value ?? 24;

    if (earlyAccessHours > 0) {
      const now = Date.now();
      visibleProperties = visibleProperties.filter((p: any) => {
        const publishedAt = p.published_at ? new Date(p.published_at).getTime() : 0;
        if (!publishedAt) return true; // no published_at means legacy listing, always visible
        const earlyAccessMs = earlyAccessHours * 60 * 60 * 1000;
        return now - publishedAt >= earlyAccessMs;
      });
    }
  }

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

  // For elite buyers, compute which listings are in the early access window
  let earlyAccessPropertyIds: string[] = [];
  if (buyerTier === "elite") {
    const adminSupabase = createAdminClient();
    const { data: setting } = await adminSupabase
      .from("admin_settings")
      .select("value")
      .eq("key", "elite_early_access_hours")
      .single();

    const earlyAccessHours: number = setting?.value ?? 24;

    if (earlyAccessHours > 0) {
      const now = Date.now();
      earlyAccessPropertyIds = visibleProperties
        .filter((p: any) => {
          const publishedAt = p.published_at ? new Date(p.published_at).getTime() : 0;
          if (!publishedAt) return false;
          const earlyAccessMs = earlyAccessHours * 60 * 60 * 1000;
          return now - publishedAt < earlyAccessMs;
        })
        .map((p: any) => p.id);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MarketplaceView
        properties={visibleProperties}
        savedPropertyIds={savedPropertyIds}
        sentMessages={sentMessageMap}
        currentUserId={user.id}
        buyerTier={buyerTier}
        earlyAccessPropertyIds={earlyAccessPropertyIds}
      />
    </div>
  );
}
