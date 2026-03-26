"use client";

import { useState } from "react";
import Link from "next/link";
import { Property } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import {
  Heart, MapPin, Bed, Bath, Maximize, Building2, Trash2
} from "lucide-react";

interface SavedListingRow {
  id: string;
  property_id: string;
  created_at: string;
  properties: Property & {
    property_photos: { id: string; url: string; display_order: number }[];
  };
}

interface Props {
  savedListings: SavedListingRow[];
}

export default function SavedListingsView({ savedListings: initial }: Props) {
  const [listings, setListings] = useState(initial);
  const [removing, setRemoving] = useState<string | null>(null);

  async function unsave(propertyId: string) {
    setRemoving(propertyId);
    const res = await fetch("/api/saved-listings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });

    if (res.ok) {
      setListings(listings.filter((l) => l.property_id !== propertyId));
    }
    setRemoving(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500" />
          Saved Listings
        </h1>
        <p className="text-muted mt-1">Properties you&apos;ve saved for later</p>
      </div>

      {listings.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <Heart className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted text-lg mb-2">No saved listings yet</p>
          <p className="text-muted text-sm mb-6">
            Browse the marketplace and tap the heart icon to save deals you&apos;re interested in.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((saved) => {
            const property = saved.properties;
            if (!property) return null;

            const photo = property.property_photos
              ?.sort((a, b) => a.display_order - b.display_order)?.[0];

            return (
              <div
                key={saved.id}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-muted transition-colors group"
              >
                <Link href={`/deals/${property.slug}`} className="block">
                  <div className="relative aspect-[16/10] bg-background">
                    {photo ? (
                      <img src={photo.url} alt={property.street_address} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <Building2 className="w-12 h-12" />
                      </div>
                    )}
                    {property.listing_status && (
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                          property.listing_status === "off_market"
                            ? "bg-orange-500/80 text-white"
                            : "bg-blue-500/80 text-white"
                        }`}>
                          {property.listing_status === "off_market" ? "Off Market" : "Listed"}
                        </span>
                      </div>
                    )}
                    {property.asking_price && (
                      <div className="absolute bottom-3 right-3">
                        <span className="bg-black/70 backdrop-blur-sm text-white font-bold px-3 py-1 rounded-lg text-lg">
                          {formatCurrency(property.asking_price)}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/deals/${property.slug}`}>
                    <h3 className="font-bold text-lg group-hover:text-accent transition-colors truncate">
                      {property.street_address}
                    </h3>
                  </Link>
                  <p className="text-muted text-sm flex items-center gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    {property.city}, {property.state} {property.zip_code}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted">
                    {property.property_type && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {property.property_type}
                      </span>
                    )}
                    {property.beds != null && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" />
                        {property.beds}
                      </span>
                    )}
                    {property.baths != null && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5" />
                        {property.baths}
                      </span>
                    )}
                    {property.sqft != null && (
                      <span className="flex items-center gap-1">
                        <Maximize className="w-3.5 h-3.5" />
                        {property.sqft.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {(property.light_rehab_arv || property.arv) && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
                      <span className="text-muted">ARV</span>
                      <span className="font-semibold text-success">
                        {formatCurrency(property.light_rehab_arv || property.arv)}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted">
                      Saved {new Date(saved.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => unsave(property.id)}
                      disabled={removing === property.id}
                      className="flex items-center gap-1.5 text-sm text-muted hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {removing === property.id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
