export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import BuyBoxFormEditor from "@/components/buy-box-form-editor";
import { BuyBoxForm } from "@/lib/buy-box-types";

export default async function EditBuyBoxFormPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: forms } = await supabase
    .from("buy_box_forms")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const form = (forms as BuyBoxForm[] | null)?.[0] || null;

  if (!form) {
    redirect("/buyers/form");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Edit Buy Box Form</h1>
        <p className="text-muted mb-8">
          Customize which fields appear on your form and how they look
        </p>
        <BuyBoxFormEditor form={form ?? undefined} />
      </div>
    </div>
  );
}
