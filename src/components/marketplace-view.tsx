"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Property } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { hasBuyerFeature } from "@/lib/membership/feature-gate";
import type { Tier } from "@/lib/membership/tier-config";
import {
  Search, SlidersHorizontal, X, MapPin, Bed, Bath, Maximize,
  Building2, Heart, Eye, DollarSign, MessageSquare, Send, ChevronDown,
  Lock, ArrowUpDown,
} from "lucide-react";
import ProBuyerBadge from "./pro-buyer-badge";

interface PropertyWithPhotos extends Property {
  property_photos: { id: string; url: string; display_order: number }[];
}

type ActionType = "request_showing" | "make_offer" | "ask_question";

type SortOption = "newest" | "oldest" | "price_asc" | "price_desc";

interface Props {
  properties: PropertyWithPhotos[];
  savedPropertyIds: string[];
  sentMessages: Record<string, string[]>;
  currentUserId: string;
  buyerTier: string;
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

const STRATEGY_OPTIONS = [
  "Fix & Flip", "BRRRR", "Buy & Hold", "Wholesale", "Creative Finance",
  "Section 8", "Short-Term Rental", "Owner Finance", "Subject To", "Land Development",
];

const DEAL_TYPE_OPTIONS = [
  { value: "wholesale_assignment", label: "Wholesale Assignment" },
  { value: "owner_sale", label: "Owner Sale" },
  { value: "off_market", label: "Off-Market" },
];

interface BasicFilters {
  state: string;
  city: string;
  zipCode: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  minBaths: string;
  minSqft: string;
  maxSqft: string;
  listingStatus: string;
  sortBy: SortOption;
}

interface AdvancedFilters {
  arvMin: string;
  arvMax: string;
  repairMin: string;
  repairMax: string;
  rentMin: string;
  rentMax: string;
  dealType: string;
  strategyFit: string;
  lotSizeMin: string;
  lotSizeMax: string;
  daysOnPlatform: string;
  hasPhotos: string;
  savedOnly: string;
  keywordSearch: string;
}

const EMPTY_BASIC: BasicFilters = {
  state: "", city: "", zipCode: "", propertyType: "",
  minPrice: "", maxPrice: "", minBeds: "", minBaths: "",
  minSqft: "", maxSqft: "", listingStatus: "", sortBy: "newest",
};

const EMPTY_ADVANCED: AdvancedFilters = {
  arvMin: "", arvMax: "", repairMin: "", repairMax: "",
  rentMin: "", rentMax: "", dealType: "", strategyFit: "",
  lotSizeMin: "", lotSizeMax: "", daysOnPlatform: "",
  hasPhotos: "", savedOnly: "", keywordSearch: "",
};

function countActive(obj: Record<string, string>, defaults: Record<string, string>): number {
  return Object.entries(obj).filter(([k, v]) => v && v !== (defaults as Record<string, string>)[k]).length;
}

type StringRecord = Record<string, string>;

export default function MarketplaceView({ properties, savedPropertyIds, sentMessages, currentUserId, buyerTier }: Props) {
  const tier = (buyerTier || "free") as Tier;
  const hasAdvancedFilters = hasBuyerFeature(tier, "advanced_filters");

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [basic, setBasic] = useState<BasicFilters>({ ...EMPTY_BASIC });
  const [advanced, setAdvanced] = useState<AdvancedFilters>({ ...EMPTY_ADVANCED });
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(savedPropertyIds));
  const [sentMsgs, setSentMsgs] = useState<Record<string, string[]>>(sentMessages);

  const activeBasicCount = countActive(basic as unknown as StringRecord, EMPTY_BASIC as unknown as StringRecord);
  const activeAdvancedCount = countActive(advanced as unknown as StringRecord, EMPTY_ADVANCED as unknown as StringRecord);
  const totalActiveFilters = activeBasicCount + activeAdvancedCount;

  // Derive unique cities from properties for the city filter
  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    for (const p of properties) {
      if (p.city) cities.add(p.city);
    }
    return Array.from(cities).sort();
  }, [properties]);

  const filtered = useMemo(() => {
    let result = properties.filter((p) => {
      // Text search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchable = [
          p.street_address, p.city, p.state, p.zip_code,
          p.title, p.property_type, p.ideal_investor_strategy,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      // --- Basic Filters ---
      if (basic.propertyType && p.property_type !== basic.propertyType) return false;
      if (basic.state && p.state !== basic.state) return false;
      if (basic.city && p.city !== basic.city) return false;
      if (basic.zipCode && p.zip_code !== basic.zipCode) return false;
      if (basic.minPrice && (p.asking_price || 0) < Number(basic.minPrice)) return false;
      if (basic.maxPrice && (p.asking_price || 0) > Number(basic.maxPrice)) return false;
      if (basic.minBeds && (p.beds || 0) < Number(basic.minBeds)) return false;
      if (basic.minBaths && (p.baths || 0) < Number(basic.minBaths)) return false;
      if (basic.minSqft && (p.sqft || 0) < Number(basic.minSqft)) return false;
      if (basic.maxSqft && (p.sqft || 0) > Number(basic.maxSqft)) return false;
      if (basic.listingStatus && p.listing_status !== basic.listingStatus) return false;

      // --- Advanced Filters (only apply when user has access) ---
      if (hasAdvancedFilters) {
        const arv = p.light_rehab_arv || p.arv || 0;
        if (advanced.arvMin && arv < Number(advanced.arvMin)) return false;
        if (advanced.arvMax && arv > Number(advanced.arvMax)) return false;

        const repair = p.repair_estimate || 0;
        if (advanced.repairMin && repair < Number(advanced.repairMin)) return false;
        if (advanced.repairMax && repair > Number(advanced.repairMax)) return false;

        const rentEst = p.rent_after_reno_high || p.rent_after_reno_low || 0;
        if (advanced.rentMin && rentEst < Number(advanced.rentMin)) return false;
        if (advanced.rentMax && rentEst > Number(advanced.rentMax)) return false;

        if (advanced.dealType) {
          if (advanced.dealType === "off_market" && p.listing_status !== "off_market") return false;
          if (advanced.dealType === "wholesale_assignment" && !p.assignment_fee) return false;
          if (advanced.dealType === "owner_sale" && p.assignment_fee) return false;
        }

        if (advanced.strategyFit) {
          const strategies = (p.ideal_investor_strategy || "").toLowerCase();
          if (!strategies.includes(advanced.strategyFit.toLowerCase())) return false;
        }

        if (advanced.lotSizeMin || advanced.lotSizeMax) {
          const lotNum = parseFloat(p.lot_size || "0");
          if (advanced.lotSizeMin && lotNum < Number(advanced.lotSizeMin)) return false;
          if (advanced.lotSizeMax && lotNum > Number(advanced.lotSizeMax)) return false;
        }

        if (advanced.daysOnPlatform) {
          const days = Math.floor((Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24));
          if (days > Number(advanced.daysOnPlatform)) return false;
        }

        if (advanced.hasPhotos === "yes") {
          if (!p.property_photos || p.property_photos.length === 0) return false;
        }
        if (advanced.hasPhotos === "no") {
          if (p.property_photos && p.property_photos.length > 0) return false;
        }

        if (advanced.savedOnly === "saved" && !savedIds.has(p.id)) return false;
        if (advanced.savedOnly === "unsaved" && savedIds.has(p.id)) return false;

        if (advanced.keywordSearch) {
          const kw = advanced.keywordSearch.toLowerCase();
          const text = [
            p.renovation_overview, p.why_deal_is_strong,
            p.neighborhood_notes, p.condition_summary,
          ].filter(Boolean).join(" ").toLowerCase();
          if (!text.includes(kw)) return false;
        }
      }

      return true;
    });

    // Sort
    switch (basic.sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "price_asc":
        result.sort((a, b) => (a.asking_price || 0) - (b.asking_price || 0));
        break;
      case "price_desc":
        result.sort((a, b) => (b.asking_price || 0) - (a.asking_price || 0));
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [properties, searchQuery, basic, advanced, hasAdvancedFilters, savedIds]);

  function clearBasicFilters() {
    setBasic({ ...EMPTY_BASIC });
  }

  function clearAdvancedFilters() {
    setAdvanced({ ...EMPTY_ADVANCED });
  }

  function clearAllFilters() {
    clearBasicFilters();
    clearAdvancedFilters();
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

  const selectClass = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground";
  const inputClass = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <ProBuyerBadge buyerTier={tier} size="md" />
        </div>
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
            showFilters || totalActiveFilters > 0
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-card text-muted hover:text-foreground"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {totalActiveFilters > 0 && (
            <span className="bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalActiveFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-6">
          {/* Basic Filters Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Basic Filters</h2>
            {totalActiveFilters > 0 && (
              <button onClick={clearAllFilters} className="text-sm text-accent hover:underline">
                Clear all
              </button>
            )}
          </div>

          {/* Basic Filters Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">State</label>
              <select
                value={basic.state}
                onChange={(e) => setBasic({ ...basic, state: e.target.value })}
                className={selectClass}
              >
                <option value="">All States</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">City</label>
              <select
                value={basic.city}
                onChange={(e) => setBasic({ ...basic, city: e.target.value })}
                className={selectClass}
              >
                <option value="">All Cities</option>
                {availableCities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Zip Code</label>
              <input
                type="text"
                value={basic.zipCode}
                onChange={(e) => setBasic({ ...basic, zipCode: e.target.value })}
                placeholder="e.g. 33101"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Property Type</label>
              <select
                value={basic.propertyType}
                onChange={(e) => setBasic({ ...basic, propertyType: e.target.value })}
                className={selectClass}
              >
                <option value="">All Types</option>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Min Price</label>
              <input
                type="number"
                value={basic.minPrice}
                onChange={(e) => setBasic({ ...basic, minPrice: e.target.value })}
                placeholder="$0"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Max Price</label>
              <input
                type="number"
                value={basic.maxPrice}
                onChange={(e) => setBasic({ ...basic, maxPrice: e.target.value })}
                placeholder="No max"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Min Beds</label>
              <select
                value={basic.minBeds}
                onChange={(e) => setBasic({ ...basic, minBeds: e.target.value })}
                className={selectClass}
              >
                <option value="">Any</option>
                {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Min Baths</label>
              <select
                value={basic.minBaths}
                onChange={(e) => setBasic({ ...basic, minBaths: e.target.value })}
                className={selectClass}
              >
                <option value="">Any</option>
                {[1,2,3,4].map((n) => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Min Sqft</label>
              <input
                type="number"
                value={basic.minSqft}
                onChange={(e) => setBasic({ ...basic, minSqft: e.target.value })}
                placeholder="No min"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Max Sqft</label>
              <input
                type="number"
                value={basic.maxSqft}
                onChange={(e) => setBasic({ ...basic, maxSqft: e.target.value })}
                placeholder="No max"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Listing Status</label>
              <select
                value={basic.listingStatus}
                onChange={(e) => setBasic({ ...basic, listingStatus: e.target.value })}
                className={selectClass}
              >
                <option value="">All</option>
                <option value="off_market">Off Market</option>
                <option value="listed">Listed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Sort By</label>
              <select
                value={basic.sortBy}
                onChange={(e) => setBasic({ ...basic, sortBy: e.target.value as SortOption })}
                className={selectClass}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Section */}
          <div className="border-t border-border pt-4">
            <button
              onClick={() => {
                if (hasAdvancedFilters) setShowAdvanced(!showAdvanced);
              }}
              className={`flex items-center justify-between w-full text-left ${
                hasAdvancedFilters ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">Advanced Filters</h2>
                {!hasAdvancedFilters && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    Pro
                  </span>
                )}
                {hasAdvancedFilters && activeAdvancedCount > 0 && (
                  <span className="bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeAdvancedCount}
                  </span>
                )}
              </div>
              {hasAdvancedFilters && (
                <div className="flex items-center gap-2">
                  {activeAdvancedCount > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); clearAdvancedFilters(); }}
                      className="text-sm text-accent hover:underline"
                    >
                      Clear
                    </button>
                  )}
                  <ChevronDown className={`w-4 h-4 text-muted transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                </div>
              )}
            </button>

            {!hasAdvancedFilters && (
              <p className="text-xs text-muted mt-2">
                Upgrade to <span className="text-amber-400 font-medium">Pro</span> to unlock investor-specific filters like ARV, repair estimates, rent projections, strategy fit, and more.
              </p>
            )}

            {hasAdvancedFilters && showAdvanced && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-xs text-muted mb-1">ARV Min</label>
                  <input
                    type="number"
                    value={advanced.arvMin}
                    onChange={(e) => setAdvanced({ ...advanced, arvMin: e.target.value })}
                    placeholder="$0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">ARV Max</label>
                  <input
                    type="number"
                    value={advanced.arvMax}
                    onChange={(e) => setAdvanced({ ...advanced, arvMax: e.target.value })}
                    placeholder="No max"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Repair Estimate Min</label>
                  <input
                    type="number"
                    value={advanced.repairMin}
                    onChange={(e) => setAdvanced({ ...advanced, repairMin: e.target.value })}
                    placeholder="$0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Repair Estimate Max</label>
                  <input
                    type="number"
                    value={advanced.repairMax}
                    onChange={(e) => setAdvanced({ ...advanced, repairMax: e.target.value })}
                    placeholder="No max"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Rent Estimate Min</label>
                  <input
                    type="number"
                    value={advanced.rentMin}
                    onChange={(e) => setAdvanced({ ...advanced, rentMin: e.target.value })}
                    placeholder="$/mo"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Rent Estimate Max</label>
                  <input
                    type="number"
                    value={advanced.rentMax}
                    onChange={(e) => setAdvanced({ ...advanced, rentMax: e.target.value })}
                    placeholder="No max"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Deal Type</label>
                  <select
                    value={advanced.dealType}
                    onChange={(e) => setAdvanced({ ...advanced, dealType: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">All</option>
                    {DEAL_TYPE_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Strategy Fit</label>
                  <select
                    value={advanced.strategyFit}
                    onChange={(e) => setAdvanced({ ...advanced, strategyFit: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">All Strategies</option>
                    {STRATEGY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Lot Size Min (acres)</label>
                  <input
                    type="number"
                    value={advanced.lotSizeMin}
                    onChange={(e) => setAdvanced({ ...advanced, lotSizeMin: e.target.value })}
                    placeholder="No min"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Lot Size Max (acres)</label>
                  <input
                    type="number"
                    value={advanced.lotSizeMax}
                    onChange={(e) => setAdvanced({ ...advanced, lotSizeMax: e.target.value })}
                    placeholder="No max"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Days on Platform</label>
                  <select
                    value={advanced.daysOnPlatform}
                    onChange={(e) => setAdvanced({ ...advanced, daysOnPlatform: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Any</option>
                    <option value="1">Last 24 hours</option>
                    <option value="3">Last 3 days</option>
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="60">Last 60 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Has Photos</label>
                  <select
                    value={advanced.hasPhotos}
                    onChange={(e) => setAdvanced({ ...advanced, hasPhotos: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Any</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">Saved / Not Saved</label>
                  <select
                    value={advanced.savedOnly}
                    onChange={(e) => setAdvanced({ ...advanced, savedOnly: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">All</option>
                    <option value="saved">Saved Only</option>
                    <option value="unsaved">Not Saved</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs text-muted mb-1">Keyword Search in Description</label>
                  <input
                    type="text"
                    value={advanced.keywordSearch}
                    onChange={(e) => setAdvanced({ ...advanced, keywordSearch: e.target.value })}
                    placeholder="Search renovation notes, deal narrative..."
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted mb-4">
        <div>
          {filtered.length} {filtered.length === 1 ? "deal" : "deals"} found
          {searchQuery && <span> for &quot;{searchQuery}&quot;</span>}
        </div>
        {!showFilters && (
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={basic.sortBy}
              onChange={(e) => setBasic({ ...basic, sortBy: e.target.value as SortOption })}
              className="bg-transparent border-none text-sm text-muted focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_asc">Price: Low</option>
              <option value="price_desc">Price: High</option>
            </select>
          </div>
        )}
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
  const [confirmAction, setConfirmAction] = useState<ActionType | null>(null);
  const photo = property.property_photos
    ?.sort((a, b) => a.display_order - b.display_order)?.[0];

  const hasSentShowing = sentTypes.includes("request_showing");
  const hasSentOffer = sentTypes.includes("make_offer");

  function handleActionClick(type: ActionType) {
    if ((type === "request_showing" && hasSentShowing) || (type === "make_offer" && hasSentOffer)) {
      setConfirmAction(type);
    } else {
      doSend(type);
    }
  }

  async function doSend(type: ActionType, customMessage?: string) {
    setSending(true);
    setConfirmAction(null);
    await onSendMessage(type, customMessage);
    setSending(false);
  }

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
            {property.ideal_investor_strategy && property.ideal_investor_strategy.split(", ").filter(Boolean).map((strategy) => (
              <span key={strategy} className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/80 text-white backdrop-blur-sm">
                {strategy}
              </span>
            ))}
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
                onClick={() => handleActionClick("request_showing")}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-colors bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 disabled:opacity-50"
              >
                <Eye className="w-3.5 h-3.5" />
                Request Showing
              </button>
              <button
                onClick={() => handleActionClick("make_offer")}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-colors bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 disabled:opacity-50"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Make Offer
              </button>
            </div>
            {/* Confirm re-send */}
            {confirmAction && (
              <div className="bg-background border border-border rounded-lg p-3 space-y-2">
                <p className="text-xs text-muted">
                  You&apos;ve already {confirmAction === "request_showing" ? "requested a showing" : "sent an offer"}. Send again?
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmAction(null)} className="flex-1 text-xs py-1.5 rounded-lg border border-border text-muted hover:text-foreground transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => doSend(confirmAction)} disabled={sending} className="flex-1 text-xs py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50">
                    {sending ? "Sending..." : "Send Again"}
                  </button>
                </div>
              </div>
            )}
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
