"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plus } from "lucide-react";

export default function CreateBuyBoxButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Generate a unique slug
      const slug =
        "buy-box-" +
        Math.random().toString(36).slice(2, 8) +
        "-" +
        Math.random().toString(36).slice(2, 6);

      // Fetch the system template fields (via API to avoid importing server-only code)
      const res = await fetch("/api/buy-box-template-fields");
      const { fields } = await res.json();

      const { error } = await supabase.from("buy_box_forms").insert({
        title: "Buyer Criteria Form",
        description:
          "Fill out this form so I can match you with the right deals.",
        fields,
        slug,
        user_id: user.id,
        is_active: true,
      });

      if (error) throw error;

      router.refresh();
    } catch (err) {
      console.error("Failed to create buy box form:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCreate}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Plus className="w-5 h-5" />
      )}
      Create Buy Box Link
    </button>
  );
}
