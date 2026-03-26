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
    property.assignment_fee
  );

  return <DealPacketView property={property} photos={photos} comps={comps} analysis={analysis} />;
}
