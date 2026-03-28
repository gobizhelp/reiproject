import { Zap, Crown } from "lucide-react";
import type { Tier } from "@/lib/membership/tier-config";
import { hasBuyerFeature } from "@/lib/membership/feature-gate";

interface ProBuyerBadgeProps {
  buyerTier: Tier;
  size?: "sm" | "md";
}

export default function ProBuyerBadge({ buyerTier, size = "sm" }: ProBuyerBadgeProps) {
  if (!hasBuyerFeature(buyerTier, "pro_buyer_badge")) return null;

  const isElite = buyerTier === "elite";
  const label = isElite ? "Elite Buyer" : "Pro Buyer";
  const Icon = isElite ? Crown : Zap;
  const colorClasses = isElite
    ? "bg-purple-500/15 text-purple-400"
    : "bg-blue-500/15 text-blue-400";
  const fillClass = isElite ? "fill-purple-400" : "fill-blue-400";

  if (size === "md") {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${colorClasses}`}>
        <Icon className={`w-3.5 h-3.5 ${fillClass}`} />
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${colorClasses}`}>
      <Icon className={`w-2.5 h-2.5 ${fillClass}`} />
      {label}
    </span>
  );
}
