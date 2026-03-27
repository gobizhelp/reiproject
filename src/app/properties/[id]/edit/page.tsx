export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import PropertyForm from "@/components/property-form";
import { profileHasSellerFeature } from "@/lib/membership/feature-gate";
import type { Profile } from "@/lib/profile-types";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: property }, { data: profile }] = await Promise.all([
    supabase
      .from("properties")
      .select("*, property_photos(*), comps(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single(),
  ]);

  if (!property) notFound();

  const hasTemplatesAccess = profile
    ? profileHasSellerFeature(profile as Profile, "listing_templates")
    : false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Edit Property</h1>
        <p className="text-muted mb-8">Update your deal packet details</p>
        <PropertyForm property={property} hasTemplatesAccess={hasTemplatesAccess} />
      </div>
    </div>
  );
}
