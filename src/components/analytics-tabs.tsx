"use client";

import { useState } from "react";
import { BarChart3, MessageSquare } from "lucide-react";

interface Props {
  listingAnalytics: React.ReactNode;
  inquiriesAnalytics: React.ReactNode;
  hasInquiriesAccess: boolean;
}

export default function AnalyticsTabs({ listingAnalytics, inquiriesAnalytics, hasInquiriesAccess }: Props) {
  const [tab, setTab] = useState<"listings" | "inquiries">("listings");

  return (
    <div>
      <div className="flex items-center gap-1 mb-6 border-b border-border">
        <button
          onClick={() => setTab("listings")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "listings"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Listing Performance
        </button>
        <button
          onClick={() => setTab("inquiries")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "inquiries"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Inquiries
          {!hasInquiriesAccess && (
            <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-semibold">PRO</span>
          )}
        </button>
      </div>

      {tab === "listings" ? listingAnalytics : inquiriesAnalytics}
    </div>
  );
}
