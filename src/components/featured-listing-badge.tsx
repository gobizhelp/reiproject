"use client";

import { Star } from "lucide-react";

interface Props {
  size?: "sm" | "md";
}

export default function FeaturedListingBadge({ size = "sm" }: Props) {
  const sizeClasses = size === "md"
    ? "px-3 py-1.5 text-sm gap-1.5"
    : "px-2 py-0.5 text-xs gap-1";

  return (
    <span className={`inline-flex items-center font-semibold rounded-full bg-amber-500/20 text-amber-400 ${sizeClasses}`}>
      <Star className={size === "md" ? "w-4 h-4 fill-current" : "w-3 h-3 fill-current"} />
      Featured
    </span>
  );
}
