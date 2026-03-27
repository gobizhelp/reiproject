export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { calculateDealAnalysis, formatCurrency, formatPercent } from "@/lib/calculations";
import { Property, PropertyPhoto, Comp } from "@/lib/types";
import { Metadata } from "next";
import DealPacketView from "@/components/deal-packet-view";
import AnalyticsTracker from "@/components/analytics-tracker";
import { profileHasBuyerFeature, hasSellerFeature } from "@/lib/membership/feature-gate";
import type { Profile } from "@/lib/profile-types";
import type { Tier } from "@/lib/membership/tier-config";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: property } = await supabase
    .from("properties")
    .select("street_address, city, state, asking_price")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!property) return { title: "Deal Not Found" };

  const title = `${property.street_address}, ${property.city} ${property.state}`;
  const description = `Off-market deal: ${property.street_address}. Asking ${formatCurrency(property.asking_price)}.`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function DealPacketPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: property } = await supabase
    .from("properties")
    .select("*, property_photos(*), comps(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!property) notFound();

  // Hide archived properties from public view entirely
  if (property.seller_status === "archived") notFound();

  const photos = (property.property_photos as PropertyPhoto[])?.sort(
    (a, b) => a.display_order - b.display_order
  ) || [];

  const comps = (property.comps as Comp[]) || [];

  const analysis = calculateDealAnalysis(
    property.arv,
    property.asking_price,
    property.repair_estimate,
    property.assignment_fee,
    property.light_rehab_budget_low,
    property.light_rehab_budget_high,
    property.full_rehab_budget_low,
    property.full_rehab_budget_high,
    property.light_rehab_arv,
    property.full_rehab_arv_low,
    property.full_rehab_arv_high,
  );

  // Fetch seller branding for branded listing page
  let sellerBranding: {
    full_name: string | null;
    company_name: string | null;
    logo_url: string | null;
    bio: string | null;
    website: string | null;
  } | null = null;

  const { data: sellerProfile } = await supabase
    .from("profiles")
    .select("full_name, company_name, logo_url, bio, website, seller_tier")
    .eq("id", property.user_id)
    .single();

  if (sellerProfile) {
    const sellerTier = (sellerProfile.seller_tier || "free") as Tier;
    const hasBranding = hasSellerFeature(sellerTier, "branded_listing_page");
    if (hasBranding && (sellerProfile.logo_url || sellerProfile.bio || sellerProfile.website)) {
      sellerBranding = {
        full_name: sellerProfile.full_name,
        company_name: sellerProfile.company_name,
        logo_url: sellerProfile.logo_url,
        bio: sellerProfile.bio,
        website: sellerProfile.website,
      };
    }
  }

  // Fetch buyer-specific data if logged in
  let isSaved = false;
  let existingConversationId: string | null = null;
  let noteContent: string | undefined;
  let hasNotesFeature: boolean | undefined;
  let sentActionTypes: string[] = [];
  const isOwn = user?.id === property.user_id;

  if (user && !isOwn) {
    const [savedRes, convRes, profileRes, noteRes, sentMsgRes] = await Promise.all([
      supabase
        .from("saved_listings")
        .select("id")
        .eq("user_id", user.id)
        .eq("property_id", property.id)
        .maybeSingle(),
      supabase
        .from("conversations")
        .select("id")
        .eq("buyer_id", user.id)
        .eq("property_id", property.id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single(),
      supabase
        .from("buyer_notes")
        .select("content")
        .eq("user_id", user.id)
        .eq("property_id", property.id)
        .maybeSingle(),
      supabase
        .from("listing_messages")
        .select("message_type")
        .eq("sender_id", user.id)
        .eq("property_id", property.id),
    ]);

    isSaved = !!savedRes.data;
    existingConversationId = convRes.data?.id || null;
    noteContent = noteRes.data?.content || "";
    sentActionTypes = (sentMsgRes.data as any[] || []).map((m: any) => m.message_type);
    const profile = profileRes.data as Profile | null;
    hasNotesFeature = profile ? profileHasBuyerFeature(profile, "private_notes") : false;
  }

  return (
    <>
    <AnalyticsTracker propertyId={property.id} eventType="view" />
    <DealPacketView
      property={property}
      photos={photos}
      comps={comps}
      analysis={analysis}
      isLoggedIn={!!user}
      isOwn={isOwn}
      isSaved={isSaved}
      existingConversationId={existingConversationId}
      sentActionTypes={sentActionTypes}
      noteContent={noteContent}
      hasNotesFeature={hasNotesFeature}
      sellerBranding={sellerBranding}
    />
    </>
  );
}
