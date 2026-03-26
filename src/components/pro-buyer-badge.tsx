import { Zap } from "lucide-react";
import type { Tier } from "@/lib/membership/tier-config";
import { hasBuyerFeature } from "@/lib/membership/feature-gate";

interface ProBuyerBadgeProps {
  buyerTier: Tier;
  size?: "sm" | "md";
}

export default function ProBuyerBadge({ buyerTier, size = "sm" }: ProBuyerBadgeProps) {
  if (!hasBuyerFeature(buyerTier, "pro_buyer_badge")) return null;

  if (size === "md") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-semibold">
        <Zap className="w-3.5 h-3.5 fill-blue-400" />
        Pro Buyer
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-semibold">
      <Zap className="w-2.5 h-2.5 fill-blue-400" />
      Pro Buyer
    </span>
  );
}
