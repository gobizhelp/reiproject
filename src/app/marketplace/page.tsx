export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import MarketplaceView from "@/components/marketplace-view";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch all published properties with photos
  const { data: properties } = await supabase
    .from("properties")
    .select("*, property_photos(id, url, display_order)")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MarketplaceView properties={properties || []} />
    </div>
  );
}
