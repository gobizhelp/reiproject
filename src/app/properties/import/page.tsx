export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import PropertyCSVImport from "@/components/property-csv-import";

export default async function ImportPropertiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Import Properties</h1>
          <p className="text-muted mt-1">
            Upload a CSV file and map columns to property fields
          </p>
        </div>
        <PropertyCSVImport />
      </div>
    </div>
  );
}
