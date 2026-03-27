"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/calculations";
import {
  MessageSquare, Phone, HelpCircle, Eye, TrendingUp,
  Loader2, Lock, ExternalLink,
} from "lucide-react";

interface PropertyInquiryData {
  id: string;
  street_address: string;
  city: string;
  state: string;
  slug: string;
  status: string;
  asking_price: number | null;
  thumbnail: string | null;
  inquiries: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

interface InquiriesData {
  properties: PropertyInquiryData[];
  totals: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byDay: { date: string; count: number }[];
  };
  days: number;
}

interface Props {
  hasAccess: boolean;
}

const ACTION_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  request_showing: { label: "Showings", icon: <Eye className="w-4 h-4" />, color: "text-blue-500" },
  make_offer: { label: "Offers", icon: <MessageSquare className="w-4 h-4" />, color: "text-green-500" },
  ask_question: { label: "Questions", icon: <HelpCircle className="w-4 h-4" />, color: "text-amber-500" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-500/20 text-blue-400" },
  contacted: { label: "Contacted", color: "bg-amber-500/20 text-amber-400" },
  negotiating: { label: "Negotiating", color: "bg-purple-500/20 text-purple-400" },
  closed_won: { label: "Won", color: "bg-green-500/20 text-green-400" },
  closed_lost: { label: "Lost", color: "bg-red-500/20 text-red-400" },
};

export default function InquiriesAnalyticsView({ hasAccess }: Props) {
  const [data, setData] = useState<InquiriesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [days, hasAccess]);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/inquiries?days=${days}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load inquiries analytics");
      }
      setData(await res.json());
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
        <h2 className="text-2xl font-bold mb-2">Inquiries Analytics is a Pro Feature</h2>
        <p className="text-muted mb-6">
          Upgrade to Seller Pro to see inquiry volume, timing, and breakdown by type for your listings.
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
        <button onClick={fetchData} className="text-accent hover:underline">Try again</button>
      </div>
    );
  }

  if (!data || data.properties.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <MessageSquare className="w-12 h-12 text-muted mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No Inquiries Yet</h2>
        <p className="text-muted">Publish listings to start receiving buyer inquiries.</p>
      </div>
    );
  }

  const { totals, properties } = data;

  return (
    <div>
      {/* Date range */}
      <div className="flex items-center gap-2 mb-6">
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-accent mb-2"><MessageSquare className="w-5 h-5" /></div>
          <div className="text-2xl font-bold tabular-nums">{totals.total}</div>
          <div className="text-muted text-xs mt-0.5">Total Inquiries</div>
        </div>
        {Object.entries(ACTION_LABELS).map(([key, { label, icon, color }]) => (
          <div key={key} className="bg-card border border-border rounded-xl p-4">
            <div className={`mb-2 ${color}`}>{icon}</div>
            <div className="text-2xl font-bold tabular-nums">{totals.byType[key] || 0}</div>
            <div className="text-muted text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      {Object.keys(totals.byStatus).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => {
            const count = totals.byStatus[key] || 0;
            if (count === 0) return null;
            return (
              <span key={key} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}>
                {label}: {count}
              </span>
            );
          })}
        </div>
      )}

      {/* Daily volume chart (simple bar) */}
      {totals.byDay.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <h3 className="text-sm font-semibold mb-4">Daily Inquiry Volume</h3>
          <div className="flex items-end gap-1 h-24">
            {totals.byDay.map((day) => {
              const maxCount = Math.max(...totals.byDay.map((d) => d.count));
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              return (
                <div
                  key={day.date}
                  className="flex-1 min-w-[4px] bg-accent/70 rounded-t hover:bg-accent transition-colors group relative"
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${day.date}: ${day.count} inquiry${day.count !== 1 ? "ies" : ""}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted">
            <span>{totals.byDay[0]?.date}</span>
            <span>{totals.byDay[totals.byDay.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Per-property table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-border/20">
                <th className="text-left py-3 px-4 font-semibold">Property</th>
                <th className="text-right py-3 px-4 font-semibold">Total</th>
                <th className="text-right py-3 px-4 font-semibold">Showings</th>
                <th className="text-right py-3 px-4 font-semibold">Offers</th>
                <th className="text-right py-3 px-4 font-semibold">Questions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((prop) => (
                <tr
                  key={prop.id}
                  className="border-b border-border/50 hover:bg-border/10 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-9 rounded-lg bg-border/30 overflow-hidden shrink-0">
                        {prop.thumbnail ? (
                          <img src={prop.thumbnail} alt={prop.street_address} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted text-xs">N/A</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{prop.street_address}</div>
                        <div className="text-muted text-xs flex items-center gap-2">
                          <span>{prop.city}, {prop.state}</span>
                          {prop.asking_price && <span>{formatCurrency(prop.asking_price)}</span>}
                        </div>
                      </div>
                      {prop.status === "published" && (
                        <Link href={`/deals/${prop.slug}`} target="_blank" className="text-muted hover:text-accent ml-auto shrink-0">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 tabular-nums font-semibold">{prop.inquiries}</td>
                  <td className="text-right py-3 px-4 tabular-nums">{prop.byType.request_showing || 0}</td>
                  <td className="text-right py-3 px-4 tabular-nums">{prop.byType.make_offer || 0}</td>
                  <td className="text-right py-3 px-4 tabular-nums">{prop.byType.ask_question || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
