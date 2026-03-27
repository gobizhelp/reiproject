import { NextRequest, NextResponse } from "next/server";

interface GeocodingResult {
  id: string;
  latitude: number;
  longitude: number;
}

const geocodeCache = new Map<string, { lat: number; lon: number } | null>();

async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address) ?? null;
  }

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

  if (!res.ok) {
    geocodeCache.set(address, null);
    return null;
  }

  const data = await res.json();
  if (!data.length) {
    geocodeCache.set(address, null);
    return null;
  }

  const result = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  geocodeCache.set(address, result);
  return result;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const properties: { id: string; address: string }[] = body.properties;

  if (!properties || !Array.isArray(properties)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Limit batch size
  const batch = properties.slice(0, 50);

  const results: GeocodingResult[] = [];

  // Process sequentially to respect Nominatim rate limits (1 req/sec)
  for (const prop of batch) {
    const cached = geocodeCache.get(prop.address);
    if (cached !== undefined) {
      if (cached) {
        results.push({ id: prop.id, latitude: cached.lat, longitude: cached.lon });
      }
      continue;
    }

    const coords = await geocodeAddress(prop.address);
    if (coords) {
      results.push({ id: prop.id, latitude: coords.lat, longitude: coords.lon });
    }

    // Rate limit: wait 1 second between uncached requests
    if (batch.indexOf(prop) < batch.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }

  return NextResponse.json({ results });
}
