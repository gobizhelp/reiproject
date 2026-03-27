"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/calculations";
import { MapPin, Building2, Bed, Bath, Maximize } from "lucide-react";

interface MapProperty {
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
  latitude: number | null;
  longitude: number | null;
  property_photos: { id: string; url: string; display_order: number }[];
}

interface PropertyMapProps {
  properties: MapProperty[];
}

export default function PropertyMap({ properties }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillRemaining, setBackfillRemaining] = useState<number | null>(null);

  // Properties that already have coordinates — instant load
  const mappable = properties.filter(
    (p) => p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)
  );
  const unmapped = properties.length - mappable.length;

  // Trigger backfill for properties missing coordinates
  useEffect(() => {
    if (unmapped === 0) return;
    setBackfillRemaining(unmapped);

    let cancelled = false;

    async function runBackfill() {
      setBackfilling(true);
      while (!cancelled) {
        try {
          const res = await fetch("/api/geocode/backfill", { method: "POST" });
          if (!res.ok) break;
          const { remaining } = await res.json();
          setBackfillRemaining(remaining);
          if (remaining === 0) break;
        } catch {
          break;
        }
      }
      setBackfilling(false);
    }

    runBackfill();
    return () => { cancelled = true; };
  }, [unmapped]);

  // Initialize and update map
  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    async function initMap() {
      const L = (await import("leaflet")).default;

      if (cancelled || !mapRef.current) return;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([39.8283, -98.5795], 4);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;

      // Clear existing markers
      for (const m of markersRef.current) map.removeLayer(m);
      markersRef.current = [];

      if (mappable.length === 0) return;

      const bounds: [number, number][] = [];

      for (const prop of mappable) {
        const priceLabel = prop.asking_price ? formatCurrency(prop.asking_price) : "N/A";

        const markerHtml = `<div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            width: max-content;
            transform: translate(-50%, -100%);
          ">
            <div style="
              background: #1d4ed8;
              color: #fff;
              padding: 6px 14px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 700;
              white-space: nowrap;
              box-shadow: 0 3px 12px rgba(0,0,0,0.4);
              border: 2px solid #fff;
              cursor: pointer;
              text-shadow: 0 1px 2px rgba(0,0,0,0.3);
              line-height: 1.2;
            ">${priceLabel}</div>
            <div style="
              width: 0; height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-top: 8px solid #1d4ed8;
              margin-top: -2px;
              filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
            "></div>
          </div>`;

        const icon = L.divIcon({
          className: "",
          html: markerHtml,
          iconSize: null,
          iconAnchor: [0, 0],
        });

        const marker = L.marker([prop.latitude!, prop.longitude!], { icon }).addTo(map);
        marker.on("click", () => setSelectedProperty(prop));

        markersRef.current.push(marker);
        bounds.push([prop.latitude!, prop.longitude!]);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      }
    }

    initMap();

    return () => { cancelled = true; };
  }, [mappable.length]);

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

      {/* Backfill banner */}
      {backfilling && backfillRemaining != null && backfillRemaining > 0 && (
        <div className="mb-3 flex items-center gap-2 text-xs text-muted bg-card border border-border rounded-lg px-3 py-2">
          <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          Geocoding {backfillRemaining} {backfillRemaining === 1 ? "property" : "properties"} in the background — they&apos;ll appear on your next visit.
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full rounded-2xl border border-border overflow-hidden"
        style={{ height: "600px" }}
      />

      {/* No results message */}
      {mappable.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-2xl z-[1000]">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted text-lg">No properties to show on map</p>
            <p className="text-muted text-sm mt-1">
              {unmapped > 0
                ? "Locations are being loaded — check back shortly"
                : "Try adjusting your filters"}
            </p>
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

      {/* Property count badge */}
      {mappable.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000] bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-muted shadow-md">
          {mappable.length} {mappable.length === 1 ? "property" : "properties"} on map
        </div>
      )}
    </div>
  );
}
