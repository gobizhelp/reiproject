export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import MatchedListingsView from "@/components/matched-listings-view";
import { profileHasBuyerFeature } from "@/lib/membership/feature-gate";
import type { Profile } from "@/lib/profile-types";
import { Lock, Target, Sparkles } from "lucide-react";

export default async function MatchedListingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch full profile for tier gating
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as Profile | null;
  const hasMatchFeed = typedProfile ? profileHasBuyerFeature(typedProfile, "match_feed") : false;

  // If user doesn't have match_feed access, show upgrade prompt
  if (!hasMatchFeed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Target className="w-8 h-8 text-accent" />
              Matched Listings
            </h1>
            <p className="text-muted mt-1">Deals that match your saved buy box criteria</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 mb-6">
              <Lock className="w-10 h-10 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Pro Feature</h2>
            <p className="text-muted max-w-md mx-auto mb-6">
              Upgrade to <span className="text-amber-400 font-semibold">Buyer Pro</span> to unlock your personalized match feed.
              See listings that match your buy box criteria automatically, ranked by relevance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-hover transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade to Pro
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 text-muted hover:text-foreground px-6 py-3 rounded-xl font-medium border border-border hover:border-muted transition-colors"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch buyer's buy boxes
  const { data: buyBoxes } = await supabase
    .from("buyer_buy_boxes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch all published properties with photos (exclude sold and archived)
  const { data: properties } = await supabase
    .from("properties")
    .select("*, property_photos(id, url, display_order)")
    .eq("status", "published")
    .in("seller_status", ["active", "pending"])
    .order("created_at", { ascending: false });

  // Fetch user's saved listing property IDs
  const { data: savedData } = await supabase
    .from("saved_listings")
    .select("property_id")
    .eq("user_id", user.id);

  const savedPropertyIds = (savedData as any[] || []).map((s: any) => s.property_id as string);

  // Fetch user's sent messages
  const { data: sentMessages } = await supabase
    .from("listing_messages")
    .select("property_id, message_type")
    .eq("sender_id", user.id);

  const sentMessageMap: Record<string, string[]> = {};
  (sentMessages as any[] || []).forEach((m: any) => {
    if (!sentMessageMap[m.property_id]) sentMessageMap[m.property_id] = [];
    sentMessageMap[m.property_id].push(m.message_type);
  });

  const debugInfo = {
    buyerTier: typedProfile?.buyer_tier ?? 'not set',
    buyBoxCount: buyBoxes?.length ?? 0,
    publishedPropertyCount: properties?.length ?? 0,
    buyBoxNames: (buyBoxes || []).map((b: any) => b.name),
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* DEBUG BANNER — remove after troubleshooting */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <details className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-sm">
          <summary className="font-semibold text-yellow-400 cursor-pointer">Debug Info (click to expand)</summary>
          <pre className="mt-2 text-xs text-muted whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
        </details>
      </div>
      <MatchedListingsView
        properties={properties || []}
        buyBoxes={buyBoxes || []}
        savedPropertyIds={savedPropertyIds}
        sentMessages={sentMessageMap}
        currentUserId={user.id}
      />
    </div>
  );
}
