export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Navbar from "@/components/navbar";
import PricingTable from "@/components/pricing-table";
import Link from "next/link";
import { Building2 } from "lucide-react";
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
      {user && <Navbar />}
      {!user && (
        <nav className="border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Building2 className="w-7 h-7 text-accent" />
              <span className="text-xl font-bold">DealPacket</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/pricing" className="text-muted hover:text-foreground transition-colors font-medium text-foreground">
                Pricing
              </Link>
              <Link href="/login" className="text-muted hover:text-foreground transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Sign up free
              </Link>
            </div>
          </div>
        </nav>
      )}
      <PricingTable
        isLoggedIn={!!user}
        buyerTier={buyerTier}
        sellerTier={sellerTier}
        userRole={userRole}
        completedFeatures={completedFeatures}
      />
    </div>
  );
}
