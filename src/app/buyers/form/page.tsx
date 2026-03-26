export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import BuyBoxFormEditor from "@/components/buy-box-form-editor";

export default async function NewBuyBoxFormPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check if user already has a form - redirect to edit if so
  const { data: forms } = await supabase
    .from("buy_box_forms")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (forms && forms.length > 0) {
    redirect("/buyers/form/edit");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Create Buy Box Form</h1>
        <p className="text-muted mb-8">
          Set up a form that buyers can fill out with their investment criteria
        </p>
        <BuyBoxFormEditor />
      </div>
    </div>
  );
}
