"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/calculations";
import {
  Eye, MousePointerClick, BarChart3, Heart, Users,
  TrendingUp, ArrowLeft, ExternalLink, Loader2, Lock,
} from "lucide-react";

interface PropertyAnalytics {
  id: string;
  street_address: string;
  city: string;
  state: string;
  slug: string;
  status: string;
  seller_status: string;
  asking_price: number | null;
  thumbnail: string | null;
  impressions: number;
  clicks: number;
  views: number;
  saves: number;
  buyBoxMatches: number;
}

interface AnalyticsData {
  properties: PropertyAnalytics[];
  totals: {
    impressions: number;
    clicks: number;
    views: number;
    saves: number;
    buyBoxMatches: number;
  };
  days: number;
}

interface Props {
  hasAccess: boolean;
}

export default function SellerAnalyticsView({ hasAccess }: Props) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }
    fetchAnalytics();
  }, [days, hasAccess]);

  async function fetchAnalytics() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/seller?days=${days}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load analytics");
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Lock className="w-12 h-12 text-muted mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Analytics is a Pro Feature</h2>
        <p className="text-muted mb-6">
          Upgrade to Seller Pro to see impressions, clicks, views, saves, and buyer match data for your properties.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          <TrendingUp className="w-5 h-5" />
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-danger mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="text-accent hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data || data.properties.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <BarChart3 className="w-12 h-12 text-muted mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No Properties Yet</h2>
        <p className="text-muted mb-6">
          Create a listing to start tracking analytics.
        </p>
        <Link
          href="/properties/new"
          className="text-accent hover:underline font-medium"
        >
          Create your first deal packet
        </Link>
      </div>
    );
  }

  const { totals, properties } = data;
  const ctr = totals.impressions > 0
    ? ((totals.clicks / totals.impressions) * 100).toFixed(1)
    : "0.0";

  return (
    <div>
      {/* Date range selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                days === d
                  ? "bg-primary text-white"
                  : "bg-border/50 text-foreground hover:bg-border"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <SummaryCard
          icon={<Eye className="w-5 h-5" />}
          label="Impressions"
          value={totals.impressions.toLocaleString()}
          color="text-blue-500"
        />
        <SummaryCard
          icon={<MousePointerClick className="w-5 h-5" />}
          label="Clicks"
          value={totals.clicks.toLocaleString()}
          subtext={`${ctr}% CTR`}
          color="text-purple-500"
        />
        <SummaryCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Views"
          value={totals.views.toLocaleString()}
          color="text-green-500"
        />
        <SummaryCard
          icon={<Heart className="w-5 h-5" />}
          label="Saves"
          value={totals.saves.toLocaleString()}
          color="text-red-500"
        />
        <SummaryCard
          icon={<Users className="w-5 h-5" />}
          label="Buy Box Matches"
          value={totals.buyBoxMatches.toLocaleString()}
          color="text-amber-500"
        />
        <SummaryCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Properties"
          value={properties.length.toLocaleString()}
          color="text-accent"
        />
      </div>

      {/* Property table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-border/20">
                <th className="text-left py-3 px-4 font-semibold">Property</th>
                <th className="text-right py-3 px-4 font-semibold">Impressions</th>
                <th className="text-right py-3 px-4 font-semibold">Clicks</th>
                <th className="text-right py-3 px-4 font-semibold">Views</th>
                <th className="text-right py-3 px-4 font-semibold">Saves</th>
                <th className="text-right py-3 px-4 font-semibold">Matches</th>
                <th className="text-right py-3 px-4 font-semibold">CTR</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((prop) => {
                const propCtr = prop.impressions > 0
                  ? ((prop.clicks / prop.impressions) * 100).toFixed(1)
                  : "0.0";
                return (
                  <tr
                    key={prop.id}
                    className="border-b border-border/50 hover:bg-border/10 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-lg bg-border/30 overflow-hidden shrink-0">
                          {prop.thumbnail ? (
                            <img
                              src={prop.thumbnail}
                              alt={prop.street_address}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                              N/A
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {prop.street_address}
                          </div>
                          <div className="text-muted text-xs flex items-center gap-2">
                            <span>{prop.city}, {prop.state}</span>
                            {prop.asking_price && (
                              <span>{formatCurrency(prop.asking_price)}</span>
                            )}
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                prop.status === "published"
                                  ? "bg-success/20 text-success"
                                  : "bg-muted/20 text-muted"
                              }`}
                            >
                              {prop.status === "published" ? "Live" : "Draft"}
                            </span>
                          </div>
                        </div>
                        {prop.status === "published" && (
                          <Link
                            href={`/deals/${prop.slug}`}
                            target="_blank"
                            className="text-muted hover:text-accent ml-auto shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums">
                      {prop.impressions.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums">
                      {prop.clicks.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums">
                      {prop.views.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums">
                      {prop.saves.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums">
                      {prop.buyBoxMatches.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums text-muted">
                      {propCtr}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-muted text-xs mt-0.5">{label}</div>
      {subtext && (
        <div className="text-muted text-xs mt-1">{subtext}</div>
      )}
    </div>
  );
}
