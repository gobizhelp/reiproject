export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { calculateDealAnalysis, formatCurrency, formatPercent } from "@/lib/calculations";
import { Property, PropertyPhoto, Comp } from "@/lib/types";
import { Metadata } from "next";
import DealPacketView from "@/components/deal-packet-view";

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

  return {
    title: `${property.street_address}, ${property.city} ${property.state} - Deal Packet`,
    description: `Off-market deal: ${property.street_address}. Asking ${formatCurrency(property.asking_price)}.`,
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

  // Fetch buyer-specific data if logged in
  let isSaved = false;
  let existingConversationId: string | null = null;
  const isOwn = user?.id === property.user_id;

  if (user && !isOwn) {
    const [savedRes, convRes] = await Promise.all([
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
    ]);

    isSaved = !!savedRes.data;
    existingConversationId = convRes.data?.id || null;
  }

  return (
    <DealPacketView
      property={property}
      photos={photos}
      comps={comps}
      analysis={analysis}
      isLoggedIn={!!user}
      isOwn={isOwn}
      isSaved={isSaved}
      existingConversationId={existingConversationId}
    />
  );
}
