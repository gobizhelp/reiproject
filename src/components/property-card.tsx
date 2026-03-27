"use client";

import { Property } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import Link from "next/link";
import { Copy, ExternalLink, Pencil, Trash2, ChevronDown, Clock, CheckCircle, Archive, RotateCcw, Star, Files } from "lucide-react";
import FeaturedListingBadge from "./featured-listing-badge";
import { useState, useRef, useEffect } from "react";

interface PropertyCardProps {
  property: Property & {
    property_photos: { id: string; url: string; display_order: number }[];
  };
  onDelete?: () => void;
  onStatusChange?: (id: string, status: Property["seller_status"]) => void;
  onToggleFeatured?: (id: string, isFeatured: boolean) => void;
  onDuplicate?: (id: string) => void;
  hasFeaturedAccess?: boolean;
  hasDuplicateAccess?: boolean;
}

const SELLER_STATUS_CONFIG = {
  active: { label: "Active", className: "bg-success/20 text-success", icon: null },
  pending: { label: "Pending", className: "bg-warning/20 text-warning", icon: Clock },
  sold: { label: "Sold", className: "bg-accent/20 text-accent", icon: CheckCircle },
  archived: { label: "Archived", className: "bg-muted/20 text-muted", icon: Archive },
} as const;

export default function PropertyCard({ property, onDelete, onStatusChange, onToggleFeatured, onDuplicate, hasFeaturedAccess, hasDuplicateAccess }: PropertyCardProps) {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const thumbnail = property.property_photos
    ?.sort((a, b) => a.display_order - b.display_order)[0]?.url;

  const sellerStatus = property.seller_status || "active";
  const statusConfig = SELLER_STATUS_CONFIG[sellerStatus];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function copyLink() {
    const url = `${window.location.origin}/deals/${property.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/50 transition-colors ${sellerStatus === "archived" ? "opacity-60" : ""}`}>
      <div className="h-40 bg-border/30 relative">
        {thumbnail ? (
          <img src={thumbnail} alt={property.street_address} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">No photos</div>
        )}
        {/* Publication status badge */}
        <span
          className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
            property.status === "published"
              ? "bg-success/20 text-success"
              : "bg-muted/20 text-muted"
          }`}
        >
          {property.status === "published" ? "Published" : "Draft"}
        </span>
        {/* Featured badge */}
        {property.is_featured && (
          <span className="absolute top-3 left-3">
            <FeaturedListingBadge />
          </span>
        )}
        {/* Seller status badge (only show if not active) */}
        {sellerStatus !== "active" && !property.is_featured && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.className}`}
          >
            {statusConfig.label}
          </span>
        )}
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
          {/* Status dropdown */}
          {onStatusChange && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center justify-center gap-1 bg-border/50 hover:bg-border p-2 rounded-lg transition-colors"
                title="Change status"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 bottom-full mb-1 w-44 bg-card border border-border rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                  {sellerStatus !== "active" && (
                    <button
                      onClick={() => { onStatusChange(property.id, "active"); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-border/50 transition-colors text-left"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-success" />
                      Mark Active
                    </button>
                  )}
                  {sellerStatus !== "pending" && (
                    <button
                      onClick={() => { onStatusChange(property.id, "pending"); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-border/50 transition-colors text-left"
                    >
                      <Clock className="w-3.5 h-3.5 text-warning" />
                      Mark Pending
                    </button>
                  )}
                  {sellerStatus !== "sold" && (
                    <button
                      onClick={() => { onStatusChange(property.id, "sold"); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-border/50 transition-colors text-left"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-accent" />
                      Mark Sold
                    </button>
                  )}
                  {sellerStatus !== "archived" ? (
                    <button
                      onClick={() => { onStatusChange(property.id, "archived"); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-border/50 transition-colors text-left"
                    >
                      <Archive className="w-3.5 h-3.5 text-muted" />
                      Archive
                    </button>
                  ) : (
                    <button
                      onClick={() => { onStatusChange(property.id, "active"); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-border/50 transition-colors text-left"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-success" />
                      Unarchive
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Featured toggle (Pro+) */}
          {onToggleFeatured && hasFeaturedAccess && (
            <button
              onClick={() => onToggleFeatured(property.id, !property.is_featured)}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                property.is_featured
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                  : "bg-border/50 text-muted hover:bg-amber-500/10 hover:text-amber-400"
              }`}
              title={property.is_featured ? "Remove featured badge" : "Mark as featured"}
            >
              <Star className={`w-4 h-4 ${property.is_featured ? "fill-current" : ""}`} />
            </button>
          )}
          {/* Duplicate (Pro+) */}
          {onDuplicate && hasDuplicateAccess && (
            <button
              onClick={() => onDuplicate(property.id)}
              className="flex items-center justify-center bg-border/50 hover:bg-accent/10 hover:text-accent p-2 rounded-lg transition-colors"
              title="Duplicate listing"
            >
              <Files className="w-4 h-4" />
            </button>
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
