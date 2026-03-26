export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import BuyBoxManager from "@/components/buy-box-manager";

export default async function MyBuyBoxesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: buyBoxes } = await supabase
    .from("buyer_buy_boxes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BuyBoxManager buyBoxes={buyBoxes || []} userId={user.id} />
    </div>
  );
}
