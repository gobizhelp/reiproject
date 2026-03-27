export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Navbar from "@/components/navbar";
import PricingTable from "@/components/pricing-table";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";
import type { Tier } from "@/lib/membership/tier-config";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let buyerTier: Tier = "free";
  let sellerTier: Tier = "free";
  let userRole: string = "buyer";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("buyer_tier, seller_tier, user_role")
      .eq("id", user.id)
      .single();

    if (profile) {
      buyerTier = profile.buyer_tier ?? "free";
      sellerTier = profile.seller_tier ?? "free";
      userRole = profile.user_role ?? "buyer";
    }
  }

  // Fetch feature checklist status from admin settings
  let completedFeatures: Record<string, boolean> = {};
  try {
    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
      .from("admin_settings")
      .select("value")
      .eq("key", "feature_checklist")
      .single();

    if (data?.value && typeof data.value === "object") {
      const val = data.value as { checked?: Record<string, boolean> };
      completedFeatures = val.checked ?? {};
    }
  } catch {
    // If admin settings not available, treat all features as not yet verified
  }

  return (
    <div className="min-h-screen bg-background">
      {user ? <Navbar /> : <MarketingNav />}
      <PricingTable
        isLoggedIn={!!user}
        buyerTier={buyerTier}
        sellerTier={sellerTier}
        userRole={userRole}
        completedFeatures={completedFeatures}
      />
      {!user && <Footer />}
    </div>
  );
}
