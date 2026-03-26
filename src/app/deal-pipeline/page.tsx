export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import DealPipelineView from "@/components/deal-pipeline-view";
import { hasBuyerFeature } from "@/lib/membership/feature-gate";
import type { Tier } from "@/lib/membership/tier-config";

export default async function DealPipelinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("buyer_tier")
    .eq("id", user.id)
    .single();

  const buyerTier: Tier = profile?.buyer_tier ?? "free";
  const hasFeature = hasBuyerFeature(buyerTier, "basic_deal_pipeline");

  let dealStages: any[] = [];

  if (hasFeature) {
    const { data } = await supabase
      .from("deal_stages")
      .select("*, properties(*, property_photos(id, url, display_order))")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    dealStages = data || [];
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <DealPipelineView
        dealStages={dealStages}
        hasFeature={hasFeature}
      />
    </div>
  );
}
