export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import PropertyCard from "@/components/property-card";
import { Plus } from "lucide-react";
import { Property } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: properties } = await supabase
    .from("properties")
    .select("*, property_photos(id, url, display_order)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Properties</h1>
            <p className="text-muted mt-1">Manage your off-market deal packets</p>
          </div>
          <Link
            href="/properties/new"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-3 rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Property
          </Link>
        </div>

        {(!properties || properties.length === 0) ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center">
            <p className="text-muted text-lg mb-4">No properties yet</p>
            <Link
              href="/properties/new"
              className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
            >
              <Plus className="w-4 h-4" />
              Create your first deal packet
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: Property & { property_photos: { id: string; url: string; display_order: number }[] }) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
