export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import PropertyForm from "@/components/property-form";
import AttachmentUpload from "@/components/attachment-upload";
import { profileHasSellerFeature } from "@/lib/membership/feature-gate";
import type { Profile } from "@/lib/profile-types";
import { Paperclip } from "lucide-react";

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

  const hasAttachmentAccess = profile
    ? profileHasSellerFeature(profile as Profile, "attachment_uploads")
    : false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Edit Property</h1>
        <p className="text-muted mb-8">Update your deal packet details</p>
        <PropertyForm property={property} hasTemplatesAccess={hasTemplatesAccess} />

        {/* Attachments section (Pro+) */}
        <section className="bg-card border border-border rounded-2xl p-6 md:p-8 mt-8">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-accent" />
            Attachments
            {!hasAttachmentAccess && (
              <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-semibold">PRO</span>
            )}
          </h2>
          <p className="text-muted text-sm mb-4">
            Upload rehab estimates, comps, flyers, or other documents for buyers
          </p>
          <AttachmentUpload propertyId={property.id} hasAccess={hasAttachmentAccess} />
        </section>
      </div>
    </div>
  );
}
