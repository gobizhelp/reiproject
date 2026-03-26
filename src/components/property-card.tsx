"use client";

import { Property } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import Link from "next/link";
import { Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface PropertyCardProps {
  property: Property & {
    property_photos: { id: string; url: string; display_order: number }[];
  };
  onDelete?: () => void;
}

export default function PropertyCard({ property, onDelete }: PropertyCardProps) {
  const [copied, setCopied] = useState(false);
  const thumbnail = property.property_photos
    ?.sort((a, b) => a.display_order - b.display_order)[0]?.url;

  function copyLink() {
    const url = `${window.location.origin}/deals/${property.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/50 transition-colors">
      <div className="h-40 bg-border/30 relative">
        {thumbnail ? (
          <img src={thumbnail} alt={property.street_address} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">No photos</div>
        )}
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
            property.status === "published"
              ? "bg-success/20 text-success"
              : "bg-muted/20 text-muted"
          }`}
        >
          {property.status === "published" ? "Published" : "Draft"}
        </span>
      </div>
      <div className="p-5">
        {property.title && <p className="text-xs text-muted font-medium uppercase tracking-wide mb-0.5 truncate">{property.title}</p>}
        <h3 className="font-semibold text-lg truncate">{property.street_address}</h3>
        <p className="text-muted text-sm">{property.city}, {property.state} {property.zip_code}</p>
        <div className="flex items-center gap-4 mt-3 text-sm">
          <span className="text-accent font-bold text-lg">{formatCurrency(property.asking_price)}</span>
          {property.arv && (
            <span className="text-muted">ARV: {formatCurrency(property.arv)}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Link
            href={`/properties/${property.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1.5 bg-border/50 hover:bg-border text-sm py-2 rounded-lg transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Link>
          {property.status === "published" && (
            <>
              <button
                onClick={copyLink}
                className="flex-1 flex items-center justify-center gap-1.5 bg-border/50 hover:bg-border text-sm py-2 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <Link
                href={`/deals/${property.slug}`}
                target="_blank"
                className="flex items-center justify-center bg-border/50 hover:bg-border p-2 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center justify-center bg-border/50 hover:bg-danger/20 hover:text-danger p-2 rounded-lg transition-colors"
              title="Delete property"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
