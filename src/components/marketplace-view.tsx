"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Property } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import {
  Search, SlidersHorizontal, X, MapPin, Bed, Bath, Maximize,
  Building2, Heart, Eye, DollarSign, MessageSquare, Send, ChevronDown
} from "lucide-react";

interface PropertyWithPhotos extends Property {
  property_photos: { id: string; url: string; display_order: number }[];
}

type ActionType = "request_showing" | "make_offer" | "ask_question";

interface Props {
  properties: PropertyWithPhotos[];
  savedPropertyIds: string[];
  sentMessages: Record<string, string[]>;
  currentUserId: string;
}

const PROPERTY_TYPES = [
  "Single Family", "Multi Family", "Townhouse", "Condo",
  "Duplex", "Triplex", "Fourplex", "Mobile Home", "Land", "Commercial",
];

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

export default function MarketplaceView({ properties, savedPropertyIds, sentMessages, currentUserId }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    propertyType: "",
    state: "",
    minPrice: "",
    maxPrice: "",
    minBeds: "",
    minBaths: "",
    listingStatus: "",
  });
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(savedPropertyIds));
  const [sentMsgs, setSentMsgs] = useState<Record<string, string[]>>(sentMessages);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          p.street_address, p.city, p.state, p.zip_code,
          p.title, p.property_type, p.ideal_investor_strategy,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      if (filters.propertyType && p.property_type !== filters.propertyType) return false;
      if (filters.state && p.state !== filters.state) return false;
      if (filters.minPrice && (p.asking_price || 0) < Number(filters.minPrice)) return false;
      if (filters.maxPrice && (p.asking_price || 0) > Number(filters.maxPrice)) return false;
      if (filters.minBeds && (p.beds || 0) < Number(filters.minBeds)) return false;
      if (filters.minBaths && (p.baths || 0) < Number(filters.minBaths)) return false;
      if (filters.listingStatus && p.listing_status !== filters.listingStatus) return false;
      return true;
    });
  }, [properties, searchQuery, filters]);

  function clearFilters() {
    setFilters({
      propertyType: "", state: "", minPrice: "", maxPrice: "",
      minBeds: "", minBaths: "", listingStatus: "",
    });
  }

  async function toggleSave(propertyId: string) {
    const isSaved = savedIds.has(propertyId);
    const next = new Set(savedIds);
    if (isSaved) {
      next.delete(propertyId);
    } else {
      next.add(propertyId);
    }
    setSavedIds(next);

    const res = await fetch("/api/saved-listings", {
      method: isSaved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });

    if (!res.ok) {
      setSavedIds(savedIds);
    }
  }

  async function sendMessage(propertyId: string, messageType: ActionType, customMessage?: string) {
    const prev = { ...sentMsgs };
    setSentMsgs({
      ...sentMsgs,
      [propertyId]: [...(sentMsgs[propertyId] || []), messageType],
    });

    const res = await fetch("/api/listing-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, messageType, customMessage }),
    });

    if (!res.ok) {
      setSentMsgs(prev);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-muted mt-1">Browse off-market deals from wholesalers</p>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by address, city, state, zip..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors font-medium text-sm ${
            showFilters || activeFilterCount > 0
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-card text-muted hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Filters</h2>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-sm text-accent hover:underline">
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="">All Types</option>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">State</label>
              <select
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="">All States</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Min Price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                placeholder="$0"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                placeholder="No max"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Min Beds</label>
              <select
                value={filters.minBeds}
                onChange={(e) => setFilters({ ...filters, minBeds: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="">Any</option>
                {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Min Baths</label>
              <select
                value={filters.minBaths}
                onChange={(e) => setFilters({ ...filters, minBaths: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="">Any</option>
                {[1,2,3,4].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Listing Status</label>
              <select
                value={filters.listingStatus}
                onChange={(e) => setFilters({ ...filters, listingStatus: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="">All</option>
                <option value="off_market">Off Market</option>
                <option value="listed">Listed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted mb-4">
        {filtered.length} {filtered.length === 1 ? "deal" : "deals"} found
        {searchQuery && <span> for &quot;{searchQuery}&quot;</span>}
      </div>

      {/* Property Grid */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <p className="text-muted text-lg mb-2">No deals match your criteria</p>
          <p className="text-muted text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((property) => (
            <MarketplaceCard
              key={property.id}
              property={property}
              isSaved={savedIds.has(property.id)}
              sentTypes={sentMsgs[property.id] || []}
              isOwn={property.user_id === currentUserId}
              onToggleSave={() => toggleSave(property.id)}
              onSendMessage={(type, msg) => sendMessage(property.id, type, msg)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MarketplaceCard({
  property,
  isSaved,
  sentTypes,
  isOwn,
  onToggleSave,
  onSendMessage,
}: {
  property: PropertyWithPhotos;
  isSaved: boolean;
  sentTypes: string[];
  isOwn: boolean;
  onToggleSave: () => void;
  onSendMessage: (type: ActionType, customMessage?: string) => void;
}) {
  const [askOpen, setAskOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const photo = property.property_photos
    ?.sort((a, b) => a.display_order - b.display_order)?.[0];

  const hasSentShowing = sentTypes.includes("request_showing");
  const hasSentOffer = sentTypes.includes("make_offer");

  async function handleAskQuestion() {
    if (!question.trim()) return;
    setSending(true);
    await onSendMessage("ask_question", question);
    setQuestion("");
    setAskOpen(false);
    setSending(false);
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-muted transition-colors group">
      {/* Photo */}
      <Link href={`/deals/${property.slug}`} className="block">
        <div className="relative aspect-[16/10] bg-background">
          {photo ? (
            <img src={photo.url} alt={property.street_address} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <Building2 className="w-12 h-12" />
            </div>
          )}
          {/* Tags overlay */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.listing_status && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                property.listing_status === "off_market"
                  ? "bg-orange-500/80 text-white"
                  : "bg-blue-500/80 text-white"
              }`}>
                {property.listing_status === "off_market" ? "Off Market" : "Listed"}
              </span>
            )}
            {property.ideal_investor_strategy && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/80 text-white backdrop-blur-sm">
                {property.ideal_investor_strategy}
              </span>
            )}
          </div>
          {/* Save button overlay */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave();
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
              isSaved
                ? "bg-red-500/80 text-white"
                : "bg-black/40 text-white/80 hover:bg-black/60 hover:text-white"
            }`}
            title={isSaved ? "Unsave listing" : "Save listing"}
          >
            <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
          </button>
          {/* Price overlay */}
          {property.asking_price && (
            <div className="absolute bottom-3 right-3">
              <span className="bg-black/70 backdrop-blur-sm text-white font-bold px-3 py-1 rounded-lg text-lg">
                {formatCurrency(property.asking_price)}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="p-4">
        <Link href={`/deals/${property.slug}`}>
          <h3 className="font-bold text-lg group-hover:text-accent transition-colors truncate">
            {property.street_address}
          </h3>
        </Link>
        <p className="text-muted text-sm flex items-center gap-1 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          {property.city}, {property.state} {property.zip_code}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted">
          {property.property_type && (
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {property.property_type}
            </span>
          )}
          {property.beds != null && (
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" />
              {property.beds}
            </span>
          )}
          {property.baths != null && (
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" />
              {property.baths}
            </span>
          )}
          {property.sqft != null && (
            <span className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5" />
              {property.sqft.toLocaleString()}
            </span>
          )}
        </div>

        {/* ARV if available */}
        {(property.light_rehab_arv || property.arv) && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted">ARV</span>
            <span className="font-semibold text-success">
              {formatCurrency(property.light_rehab_arv || property.arv)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {!isOwn && (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => onSendMessage("request_showing")}
                disabled={hasSentShowing}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-colors ${
                  hasSentShowing
                    ? "bg-success/20 text-success border border-success/30 cursor-default"
                    : "bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                {hasSentShowing ? "Requested" : "Request Showing"}
              </button>
              <button
                onClick={() => onSendMessage("make_offer")}
                disabled={hasSentOffer}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-colors ${
                  hasSentOffer
                    ? "bg-success/20 text-success border border-success/30 cursor-default"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                {hasSentOffer ? "Sent" : "Make Offer"}
              </button>
            </div>
            {!askOpen ? (
              <button
                onClick={() => setAskOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-muted hover:text-foreground py-2 rounded-lg border border-border hover:border-muted transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Ask a Question
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
                  placeholder="Type your question..."
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                  autoFocus
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || sending}
                  className="px-3 py-2 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
