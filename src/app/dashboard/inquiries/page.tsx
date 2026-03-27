export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import InquiryStatusTracker from "@/components/inquiry-status-tracker";
import { profileHasSellerFeature } from "@/lib/membership/feature-gate";
import type { Profile } from "@/lib/profile-types";
import { ArrowLeft, MessageSquare } from "lucide-react";

export default async function InquiriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as Profile | null;
  const hasAccess = typedProfile
    ? profileHasSellerFeature(typedProfile, "inquiry_status_tracking")
    : false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-border/50 hover:bg-border transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-accent" />
              Inquiry Tracker
            </h1>
            <p className="text-muted mt-1">
              Track and manage buyer inquiries by status
            </p>
          </div>
        </div>

        <InquiryStatusTracker hasAccess={hasAccess} />
      </div>
    </div>
  );
}
