"use client";

import { Building2, Globe, ExternalLink } from "lucide-react";

interface SellerBranding {
  full_name: string | null;
  company_name: string | null;
  logo_url: string | null;
  bio: string | null;
  website: string | null;
}

interface Props {
  seller: SellerBranding;
}

export default function SellerBrandingCard({ seller }: Props) {
  const displayName = seller.company_name || seller.full_name;
  if (!displayName) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-xs text-muted uppercase tracking-wide font-medium mb-3">Listed By</p>
      <div className="flex items-start gap-3">
        {seller.logo_url ? (
          <img
            src={seller.logo_url}
            alt={displayName}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-border"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-accent" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{displayName}</p>
          {seller.bio && (
            <p className="text-muted text-sm mt-1 line-clamp-3">{seller.bio}</p>
          )}
          {seller.website && (
            <a
              href={seller.website.startsWith("http") ? seller.website : `https://${seller.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent text-sm mt-2 hover:underline"
            >
              <Globe className="w-3.5 h-3.5" />
              {seller.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
