export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import PropertyList from "@/components/property-list";
import { Plus, Upload, BarChart3, MessageSquare } from "lucide-react";
import { Property } from "@/lib/types";
import { profileHasSellerFeature } from "@/lib/membership/feature-gate";
import type { Profile } from "@/lib/profile-types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: properties }, { data: profile }] = await Promise.all([
    supabase
      .from("properties")
      .select("*, property_photos(id, url, display_order)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
  ]);

  const typedProfile = profile as Profile | null;

  // Sync active_view to "seller" if a "both" user navigates here directly
  if (typedProfile?.user_role === "both" && typedProfile.active_view !== "seller") {
    await supabase
      .from("profiles")
      .update({ active_view: "seller" })
      .eq("id", user.id);
  }

  const hasAnalytics = typedProfile
    ? profileHasSellerFeature(typedProfile, "listing_analytics")
    : false;

  const hasInquiryTracking = typedProfile
    ? profileHasSellerFeature(typedProfile, "inquiry_status_tracking")
    : false;

  const hasFeaturedAccess = typedProfile
    ? profileHasSellerFeature(typedProfile, "featured_listing_badge")
    : false;

  const hasDuplicateAccess = typedProfile
    ? profileHasSellerFeature(typedProfile, "duplicate_listing")
    : false;

  const hasTemplatesAccess = typedProfile
    ? profileHasSellerFeature(typedProfile, "listing_templates")
    : false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Properties</h1>
            <p className="text-muted mt-1">Manage your off-market deal packets</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/inquiries"
              className={`inline-flex items-center gap-2 border px-4 py-2.5 rounded-xl font-medium transition-colors text-sm ${
                hasInquiryTracking
                  ? "border-accent/50 text-accent hover:bg-accent/10"
                  : "border-border text-muted hover:border-accent/30"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Inquiries
              {!hasInquiryTracking && (
                <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-semibold">PRO</span>
              )}
            </Link>
            <Link
              href="/dashboard/analytics"
              className={`inline-flex items-center gap-2 border px-4 py-2.5 rounded-xl font-medium transition-colors text-sm ${
                hasAnalytics
                  ? "border-accent/50 text-accent hover:bg-accent/10"
                  : "border-border text-muted hover:border-accent/30"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
              {!hasAnalytics && (
                <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-semibold">PRO</span>
              )}
            </Link>
            <Link
              href="/properties/import"
              className="inline-flex items-center gap-2 border border-border hover:border-accent/50 text-foreground px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </Link>
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Property
            </Link>
          </div>
        </div>

        {(!properties || properties.length === 0) ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center">
            <p className="text-muted text-lg mb-4">No properties yet</p>
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
            >
              <Plus className="w-4 h-4" />
              Create your first deal packet
            </Link>
          </div>
        ) : (
          <PropertyList
            properties={properties as (Property & { property_photos: { id: string; url: string; display_order: number }[] })[]}
            hasFeaturedAccess={hasFeaturedAccess}
            hasDuplicateAccess={hasDuplicateAccess}
          />
        )}
      </div>
    </div>
  );
}
