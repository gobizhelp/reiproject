export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import BuyerDirectory from "@/components/buyer-directory";
import { BuyBoxForm, BuyBoxSubmission } from "@/lib/buy-box-types";
import { Users, Upload } from "lucide-react";
import CopyLinkButtonClient from "@/components/copy-link-button";
import CreateBuyBoxButton from "@/components/create-buy-box-button";

export default async function BuyersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get the user's buy box form (exclude system template)
  const { data: forms } = await supabase
    .from("buy_box_forms")
    .select("*")
    .eq("user_id", user.id)
    .neq("slug", "__system_buy_box_template__")
    .order("created_at", { ascending: false });

  const form = (forms as BuyBoxForm[] | null)?.[0] || null;

  // Get submissions if form exists
  let submissions: BuyBoxSubmission[] = [];
  let platformEmails: Set<string> = new Set();
  let platformPhones: Set<string> = new Set();
  if (form) {
    const { data } = await supabase
      .from("buy_box_submissions")
      .select("*")
      .eq("form_id", form.id)
      .order("created_at", { ascending: false });
    submissions = (data as BuyBoxSubmission[]) || [];

    // Check which buyers are registered platform users (by email or phone)
    if (submissions.length > 0) {
      const emails = submissions.map((s) => s.email).filter(Boolean);
      const phones = submissions.map((s) => s.phone).filter((p): p is string => !!p && p.trim() !== "");
      const { data: matches } = await supabase.rpc("check_platform_users", {
        check_emails: emails,
        check_phones: phones,
      });
      if (matches) {
        for (const m of matches) {
          if (m.matched_email) platformEmails.add(m.matched_email.toLowerCase());
          if (m.matched_phone) platformPhones.add(m.matched_phone);
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Buyer Directory</h1>
            <p className="text-muted mt-1">
              {form
                ? `${submissions.length} buyer${submissions.length !== 1 ? "s" : ""} in your directory`
                : "Set up your buy box link to start collecting buyers"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {form ? (
              <Link
                href="/buyers/import"
                className="flex items-center gap-2 border border-border hover:border-accent/50 text-foreground px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </Link>
            ) : (
              <CreateBuyBoxButton />
            )}
          </div>
        </div>

        {form ? (
          <>
            {/* Form Link Bar */}
            <FormLinkBar slug={form.slug} isActive={form.is_active} />
            {/* Directory */}
            <BuyerDirectory submissions={submissions} formId={form.id} platformEmails={[...platformEmails]} platformPhones={[...platformPhones]} />
          </>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-16 text-center">
            <Users className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted text-lg mb-2">No buy box form yet</p>
            <p className="text-muted text-sm mb-6">
              Create your buy box link to start collecting buyer criteria. The form is standardized across the platform for better matching.
            </p>
            <CreateBuyBoxButton />
          </div>
        )}
      </div>
    </div>
  );
}

function FormLinkBar({ slug, isActive }: { slug: string; isActive: boolean }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <span
          className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-success" : "bg-muted"}`}
        />
        <span className="text-sm">
          {isActive ? "Form is live" : "Form is paused"}
        </span>
        <span className="text-muted text-sm hidden md:inline">
          /buy-box/{slug}
        </span>
      </div>
      <CopyLinkButton slug={slug} />
    </div>
  );
}

function CopyLinkButton({ slug }: { slug: string }) {
  return <CopyLinkButtonClient slug={slug} />;
}
