import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

interface GeoDBCity {
  city: string;
  region: string;
  regionCode: string;
  country: string;
  countryCode: string;
  population: number;
}

interface GeoDBResponse {
  data: GeoDBCity[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return Response.json({ cities: [] });
  }

  try {
    const url = new URL(
      "https://geodb-free-service.wirefreethought.com/v1/geo/cities"
    );
    url.searchParams.set("namePrefix", query);
    url.searchParams.set("countryIds", "US");
    url.searchParams.set("limit", "10");
    url.searchParams.set("sort", "-population");
    url.searchParams.set("types", "CITY");

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 }, // cache 24h
    });

    if (!res.ok) {
      throw new Error(`GeoDB API returned ${res.status}`);
    }

    const data: GeoDBResponse = await res.json();

    const cities = data.data.map((c) => ({
      city: c.city,
      state: c.regionCode,
      label: `${c.city}, ${c.regionCode}`,
      population: c.population,
    }));

    return Response.json({ cities });
  } catch (error) {
    console.error("City search error:", error);
    return Response.json({ cities: [], error: "Failed to search cities" }, { status: 500 });
  }
}
