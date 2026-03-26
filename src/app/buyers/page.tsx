export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import BuyerDirectory from "@/components/buyer-directory";
import { BuyBoxForm, BuyBoxSubmission } from "@/lib/buy-box-types";
import { Plus, Settings, Users, Upload } from "lucide-react";
import CopyLinkButtonClient from "@/components/copy-link-button";

export default async function BuyersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get the user's buy box form
  const { data: forms } = await supabase
    .from("buy_box_forms")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const form = (forms as BuyBoxForm[] | null)?.[0] || null;

  // Get submissions if form exists
  let submissions: BuyBoxSubmission[] = [];
  if (form) {
    const { data } = await supabase
      .from("buy_box_submissions")
      .select("*")
      .eq("form_id", form.id)
      .order("created_at", { ascending: false });
    submissions = (data as BuyBoxSubmission[]) || [];
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
                : "Set up your buy box form to start collecting buyers"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {form ? (
              <>
                <Link
                  href="/buyers/import"
                  className="flex items-center gap-2 border border-border hover:border-accent/50 text-foreground px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Import CSV
                </Link>
                <Link
                  href="/buyers/form/edit"
                  className="flex items-center gap-2 border border-border hover:border-accent/50 text-foreground px-4 py-2.5 rounded-xl font-medium transition-colors text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Edit Form
                </Link>
              </>
            ) : (
              <Link
                href="/buyers/form"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-3 rounded-xl font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Buy Box Form
              </Link>
            )}
          </div>
        </div>

        {form ? (
          <>
            {/* Form Link Bar */}
            <FormLinkBar slug={form.slug} isActive={form.is_active} />
            {/* Directory */}
            <BuyerDirectory submissions={submissions} formId={form.id} />
          </>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-16 text-center">
            <Users className="w-16 h-16 text-muted mx-auto mb-4" />
            <p className="text-muted text-lg mb-2">No buy box form yet</p>
            <p className="text-muted text-sm mb-6">
              Create a buy box form that buyers can fill out. You&apos;ll build a searchable directory of all your buyers.
            </p>
            <Link
              href="/buyers/form"
              className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
            >
              <Plus className="w-4 h-4" />
              Create your first buy box form
            </Link>
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
