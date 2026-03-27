import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { geocodeAddress } from "../route";

// POST: Backfill coordinates for properties missing lat/lng.
// Processes up to 10 at a time (Nominatim 1 req/sec), returns how many remain.
export async function POST() {
  const supabase = createAdminClient();

  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, street_address, city, state, zip_code")
    .is("latitude", null)
    .eq("status", "published")
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!properties || properties.length === 0) {
    return NextResponse.json({ processed: 0, remaining: 0 });
  }

  let processed = 0;

  for (const prop of properties) {
    const address = `${prop.street_address}, ${prop.city}, ${prop.state} ${prop.zip_code}`;
    const coords = await geocodeAddress(address);

    if (coords) {
      await supabase
        .from("properties")
        .update({ latitude: coords.lat, longitude: coords.lon })
        .eq("id", prop.id);
      processed++;
    } else {
      // Set to 0,0 sentinel so we don't retry forever (will be filtered out on read)
      await supabase
        .from("properties")
        .update({ latitude: 0, longitude: 0 })
        .eq("id", prop.id);
    }

    // Rate limit
    if (properties.indexOf(prop) < properties.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }

  // Check how many remain
  const { count } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .is("latitude", null)
    .eq("status", "published");

  return NextResponse.json({ processed, remaining: count ?? 0 });
}
