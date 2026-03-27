import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  const params = new URLSearchParams({
    q: address,
    format: "json",
    limit: "1",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: { "User-Agent": "REIReach/1.0" },
      next: { revalidate: 86400 },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.length) return null;

  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

// POST: Geocode a single property and persist to DB (called from property-form on save)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { propertyId, address } = body as { propertyId: string; address: string };

  if (!propertyId || !address) {
    return NextResponse.json({ error: "Missing propertyId or address" }, { status: 400 });
  }

  const coords = await geocodeAddress(address);
  if (!coords) {
    return NextResponse.json({ geocoded: false });
  }

  const supabase = createAdminClient();
  await supabase
    .from("properties")
    .update({ latitude: coords.lat, longitude: coords.lon })
    .eq("id", propertyId);

  return NextResponse.json({ geocoded: true, latitude: coords.lat, longitude: coords.lon });
}
