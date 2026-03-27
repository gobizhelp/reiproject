"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/calculations";
import { MapPin, Loader2, Building2, Bed, Bath, Maximize } from "lucide-react";

interface PropertyWithPhotos {
  id: string;
  slug: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  asking_price: number | null;
  property_type: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  light_rehab_arv: number | null;
  arv: number | null;
  ideal_investor_strategy: string | null;
  property_photos: { id: string; url: string; display_order: number }[];
}

interface GeocodedProperty extends PropertyWithPhotos {
  latitude: number;
  longitude: number;
}

interface PropertyMapProps {
  properties: PropertyWithPhotos[];
}

export default function PropertyMap({ properties }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [geocoded, setGeocoded] = useState<GeocodedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [selectedProperty, setSelectedProperty] = useState<GeocodedProperty | null>(null);

  const geocodeProperties = useCallback(async () => {
    if (properties.length === 0) {
      setLoading(false);
      return;
    }

    // Check sessionStorage for cached coordinates
    const cached: Record<string, { lat: number; lon: number }> = {};
    const uncached: { id: string; address: string }[] = [];

    for (const p of properties) {
      const key = `geo_${p.id}`;
      const stored = sessionStorage.getItem(key);
      if (stored) {
        try {
          cached[p.id] = JSON.parse(stored);
        } catch {
          uncached.push({
            id: p.id,
            address: `${p.street_address}, ${p.city}, ${p.state} ${p.zip_code}`,
          });
        }
      } else {
        uncached.push({
          id: p.id,
          address: `${p.street_address}, ${p.city}, ${p.state} ${p.zip_code}`,
        });
      }
    }

    // Build initial geocoded list from cache
    const initial: GeocodedProperty[] = [];
    for (const p of properties) {
      if (cached[p.id]) {
        initial.push({ ...p, latitude: cached[p.id].lat, longitude: cached[p.id].lon });
      }
    }
    setGeocoded(initial);
    setProgress({ done: initial.length, total: properties.length });

    if (uncached.length === 0) {
      setLoading(false);
      return;
    }

    // Batch geocode in chunks of 10
    const chunkSize = 10;
    for (let i = 0; i < uncached.length; i += chunkSize) {
      const chunk = uncached.slice(i, i + chunkSize);
      try {
        const res = await fetch("/api/geocode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ properties: chunk }),
        });

        if (res.ok) {
          const { results } = await res.json();
          const newGeocoded: GeocodedProperty[] = [];

          for (const r of results as { id: string; latitude: number; longitude: number }[]) {
            sessionStorage.setItem(`geo_${r.id}`, JSON.stringify({ lat: r.latitude, lon: r.longitude }));
            const prop = properties.find((p) => p.id === r.id);
            if (prop) {
              newGeocoded.push({ ...prop, latitude: r.latitude, longitude: r.longitude });
            }
          }

          setGeocoded((prev) => {
            const ids = new Set(prev.map((p) => p.id));
            const merged = [...prev];
            for (const np of newGeocoded) {
              if (!ids.has(np.id)) merged.push(np);
            }
            return merged;
          });
          setProgress((prev) => ({ ...prev, done: prev.done + results.length }));
        }
      } catch {
        // Continue with next chunk on error
      }
    }

    setLoading(false);
  }, [properties]);

  // Geocode on mount
  useEffect(() => {
    geocodeProperties();
  }, [geocodeProperties]);

  // Initialize and update map
  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (cancelled || !mapRef.current) return;

      // Clean up existing map
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([39.8283, -98.5795], 4); // Center of US

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;

      // Add markers
      updateMarkers(L, map);
    }

    function updateMarkers(L: any, map: any) {
      // Clear existing markers
      for (const m of markersRef.current) {
        map.removeLayer(m);
      }
      markersRef.current = [];

      if (geocoded.length === 0) return;

      const bounds: [number, number][] = [];

      for (const prop of geocoded) {
        const priceLabel = prop.asking_price ? formatCurrency(prop.asking_price) : "N/A";

        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div style="
            background: #3b82f6;
            color: white;
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
            cursor: pointer;
            transform: translate(-50%, -100%);
          ">${priceLabel}</div>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([prop.latitude, prop.longitude], { icon }).addTo(map);
        marker.on("click", () => {
          setSelectedProperty(prop);
        });

        markersRef.current.push(marker);
        bounds.push([prop.latitude, prop.longitude]);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }

    initMap();

    return () => {
      cancelled = true;
    };
  }, [geocoded]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  const photo = selectedProperty?.property_photos
    ?.sort((a, b) => a.display_order - b.display_order)?.[0];

  return (
    <div className="relative">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-card border border-border rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          <span className="text-sm text-muted">
            Loading locations... {progress.done}/{progress.total}
          </span>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full rounded-2xl border border-border overflow-hidden"
        style={{ height: "600px" }}
      />

      {/* No results message */}
      {!loading && geocoded.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-2xl z-[1000]">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted text-lg">No properties to show on map</p>
            <p className="text-muted text-sm mt-1">Try adjusting your filters</p>
          </div>
        </div>
      )}

      {/* Property popup card */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[1000] bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
          <button
            onClick={() => setSelectedProperty(null)}
            className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            &times;
          </button>

          <Link href={`/deals/${selectedProperty.slug}`} className="block">
            <div className="relative aspect-[16/9] bg-background">
              {photo ? (
                <img
                  src={photo.url}
                  alt={selectedProperty.street_address}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">
                  <Building2 className="w-10 h-10" />
                </div>
              )}
              {selectedProperty.asking_price && (
                <div className="absolute bottom-2 right-2">
                  <span className="bg-black/70 backdrop-blur-sm text-white font-bold px-3 py-1 rounded-lg text-lg">
                    {formatCurrency(selectedProperty.asking_price)}
                  </span>
                </div>
              )}
            </div>
          </Link>

          <div className="p-4">
            <Link href={`/deals/${selectedProperty.slug}`}>
              <h3 className="font-bold text-base hover:text-accent transition-colors truncate">
                {selectedProperty.street_address}
              </h3>
            </Link>
            <p className="text-muted text-sm flex items-center gap-1 mb-2">
              <MapPin className="w-3.5 h-3.5" />
              {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip_code}
            </p>

            <div className="flex items-center gap-3 text-sm text-muted">
              {selectedProperty.property_type && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {selectedProperty.property_type}
                </span>
              )}
              {selectedProperty.beds != null && (
                <span className="flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5" />
                  {selectedProperty.beds}
                </span>
              )}
              {selectedProperty.baths != null && (
                <span className="flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5" />
                  {selectedProperty.baths}
                </span>
              )}
              {selectedProperty.sqft != null && (
                <span className="flex items-center gap-1">
                  <Maximize className="w-3.5 h-3.5" />
                  {selectedProperty.sqft.toLocaleString()}
                </span>
              )}
            </div>

            {(selectedProperty.light_rehab_arv || selectedProperty.arv) && (
              <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted">ARV</span>
                <span className="font-semibold text-success">
                  {formatCurrency(selectedProperty.light_rehab_arv || selectedProperty.arv)}
                </span>
              </div>
            )}

            {selectedProperty.ideal_investor_strategy && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedProperty.ideal_investor_strategy.split(", ").filter(Boolean).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-accent/10 text-accent border border-accent/30">
                    {s}
                  </span>
                ))}
              </div>
            )}

            <Link
              href={`/deals/${selectedProperty.slug}`}
              className="mt-3 block w-full text-center text-sm font-medium py-2 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
            >
              View Deal Details
            </Link>
          </div>
        </div>
      )}

      {/* Geocoded count badge */}
      {!loading && geocoded.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000] bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-muted shadow-md">
          {geocoded.length} {geocoded.length === 1 ? "property" : "properties"} on map
        </div>
      )}
    </div>
  );
}
