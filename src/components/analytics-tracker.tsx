"use client";

import { useEffect, useRef } from "react";

interface AnalyticsTrackerProps {
  propertyId: string;
  eventType: "impression" | "click" | "view";
}

export default function AnalyticsTracker({ propertyId, eventType }: AnalyticsTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, eventType }),
    }).catch(() => {
      // Silently fail - analytics should never block UX
    });
  }, [propertyId, eventType]);

  return null;
}
