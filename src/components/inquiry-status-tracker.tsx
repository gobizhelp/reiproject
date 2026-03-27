"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare, Loader2, Lock, TrendingUp,
  ChevronDown, User, Clock,
} from "lucide-react";
import type { InquiryStatus } from "@/lib/types";

interface InquiryItem {
  id: string;
  property_id: string;
  buyer_id: string;
  initial_action: string;
  inquiry_status: InquiryStatus;
  inquiry_status_updated_at: string;
  buyer_shared_contact: boolean;
  created_at: string;
  updated_at: string;
  properties: {
    id: string;
    slug: string;
    street_address: string;
    city: string;
    state: string;
  };
  buyer: {
    full_name: string;
    company_name?: string;
  };
}

interface Props {
  hasAccess: boolean;
  propertyId?: string;
}

const STATUS_CONFIG: Record<InquiryStatus, { label: string; color: string; bgColor: string }> = {
  new: { label: "New", color: "text-blue-400", bgColor: "bg-blue-500/20 text-blue-400" },
  contacted: { label: "Contacted", color: "text-amber-400", bgColor: "bg-amber-500/20 text-amber-400" },
  negotiating: { label: "Negotiating", color: "text-purple-400", bgColor: "bg-purple-500/20 text-purple-400" },
  closed_won: { label: "Closed - Won", color: "text-green-400", bgColor: "bg-green-500/20 text-green-400" },
  closed_lost: { label: "Closed - Lost", color: "text-red-400", bgColor: "bg-red-500/20 text-red-400" },
};

const ACTION_LABELS: Record<string, string> = {
  request_showing: "Showing Request",
  make_offer: "Offer",
  ask_question: "Question",
};

export default function InquiryStatusTracker({ hasAccess, propertyId }: Props) {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<InquiryStatus | "all">("all");

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }
    fetchInquiries();
  }, [hasAccess, propertyId]);

  async function fetchInquiries() {
    setLoading(true);
    setError(null);
    try {
      const url = propertyId
        ? `/api/inquiry-status?propertyId=${propertyId}`
        : "/api/inquiry-status";
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to load");
      }
      const data = await res.json();
      setInquiries(data.inquiries);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(conversationId: string, newStatus: InquiryStatus) {
    setUpdatingId(conversationId);
    try {
      const res = await fetch("/api/inquiry-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, status: newStatus }),
      });

      if (res.ok) {
        setInquiries((prev) =>
          prev.map((inq) =>
            inq.id === conversationId
              ? { ...inq, inquiry_status: newStatus, inquiry_status_updated_at: new Date().toISOString() }
              : inq
          )
        );
      }
    } catch {
      // Silently fail
    } finally {
      setUpdatingId(null);
    }
  }

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Lock className="w-12 h-12 text-muted mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Inquiry Tracking is a Pro Feature</h2>
        <p className="text-muted mb-6">
          Upgrade to Seller Pro to track buyer inquiries by status — new, contacted, negotiating, or closed.
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
      <div className="text-center py-16">
        <p className="text-danger mb-4">{error}</p>
        <button onClick={fetchInquiries} className="text-accent hover:underline">Try again</button>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-16">
        <MessageSquare className="w-12 h-12 text-muted mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No Inquiries Yet</h2>
        <p className="text-muted">Buyer inquiries will appear here once you receive them.</p>
      </div>
    );
  }

  // Status summary counts
  const statusCounts: Record<string, number> = {};
  for (const inq of inquiries) {
    statusCounts[inq.inquiry_status] = (statusCounts[inq.inquiry_status] || 0) + 1;
  }

  const filtered = filterStatus === "all"
    ? inquiries
    : inquiries.filter((inq) => inq.inquiry_status === filterStatus);

  return (
    <div>
      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            filterStatus === "all" ? "bg-primary text-white" : "bg-border/50 text-foreground hover:bg-border"
          }`}
        >
          All ({inquiries.length})
        </button>
        {(Object.entries(STATUS_CONFIG) as [InquiryStatus, typeof STATUS_CONFIG[InquiryStatus]][]).map(
          ([key, config]) => {
            const count = statusCounts[key] || 0;
            if (count === 0 && filterStatus !== key) return null;
            return (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filterStatus === key ? "bg-primary text-white" : `${config.bgColor} hover:opacity-80`
                }`}
              >
                {config.label} ({count})
              </button>
            );
          }
        )}
      </div>

      {/* Inquiry cards */}
      <div className="space-y-3">
        {filtered.map((inq) => {
          const statusConfig = STATUS_CONFIG[inq.inquiry_status];
          return (
            <div
              key={inq.id}
              className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {/* Buyer + property info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-muted shrink-0" />
                  <span className="font-medium truncate">
                    {inq.buyer.full_name}
                    {inq.buyer.company_name && (
                      <span className="text-muted text-sm"> ({inq.buyer.company_name})</span>
                    )}
                  </span>
                </div>
                <div className="text-sm text-muted flex flex-wrap items-center gap-2">
                  <span>{inq.properties.street_address}, {inq.properties.city}, {inq.properties.state}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-border/50">
                    {ACTION_LABELS[inq.initial_action] || inq.initial_action}
                  </span>
                </div>
                <div className="text-xs text-muted mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(inq.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Status selector */}
              <div className="relative shrink-0">
                {updatingId === inq.id ? (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted" />
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={inq.inquiry_status}
                      onChange={(e) => updateStatus(inq.id, e.target.value as InquiryStatus)}
                      className={`appearance-none pl-3 pr-8 py-2 rounded-lg text-xs font-semibold border-0 cursor-pointer ${statusConfig.bgColor} focus:outline-none focus:ring-2 focus:ring-accent`}
                    >
                      {(Object.entries(STATUS_CONFIG) as [InquiryStatus, typeof STATUS_CONFIG[InquiryStatus]][]).map(
                        ([key, config]) => (
                          <option key={key} value={key}>
                            {config.label}
                          </option>
                        )
                      )}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Link to conversation */}
              <Link
                href={`/messages/${inq.id}`}
                className="text-xs text-accent hover:underline shrink-0"
              >
                View Messages
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
