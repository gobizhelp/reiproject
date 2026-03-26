export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/navbar";
import PricingTable from "@/components/pricing-table";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      {user && <Navbar />}
      {!user && (
        <nav className="border-b border-border bg-card px-6 py-4">
          <span className="text-xl font-bold">DealPacket</span>
        </nav>
      )}
      <PricingTable />
    </div>
  );
}
