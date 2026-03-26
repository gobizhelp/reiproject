"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Property } from "@/lib/types";
import { BuyerBuyBox } from "@/lib/profile-types";
import { formatCurrency } from "@/lib/calculations";
import { matchProperties, type MatchedProperty } from "@/lib/matching";
import {
  Target, MapPin, Bed, Bath, Maximize, Building2, Heart,
  Eye, DollarSign, MessageSquare, Send, Package, ChevronDown,
  Sparkles, ArrowUpDown, Filter,
} from "lucide-react";

interface PropertyWithPhotos extends Property {
  property_photos: { id: string; url: string; display_order: number }[];
}

type ActionType = "request_showing" | "make_offer" | "ask_question";
type SortOption = "best_match" | "newest" | "price_asc" | "price_desc";

interface Props {
  properties: PropertyWithPhotos[];
  buyBoxes: BuyerBuyBox[];
  savedPropertyIds: string[];
  sentMessages: Record<string, string[]>;
  currentUserId: string;
}

export default function MatchedListingsView({
  properties,
  buyBoxes,
  savedPropertyIds,
  sentMessages,
  currentUserId,
}: Props) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(savedPropertyIds));
  const [sentMsgs, setSentMsgs] = useState<Record<string, string[]>>(sentMessages);
  const [selectedBuyBox, setSelectedBuyBox] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("best_match");
  const [showBuyBoxFilter, setShowBuyBoxFilter] = useState(false);

  const allMatched = useMemo(
    () => matchProperties(properties, buyBoxes, 50),
    [properties, buyBoxes]
  );

  const filtered = useMemo(() => {
    let result = allMatched;

    // Filter by specific buy box
    if (selectedBuyBox !== "all") {
      result = result.filter((m) =>
        m.matchedBuyBoxes.some((b) => b.buyBoxId === selectedBuyBox)
      );
    }

    // Sort
    switch (sortBy) {
      case "newest":
        result = [...result].sort(
          (a, b) =>
            new Date(b.property.created_at).getTime() -
            new Date(a.property.created_at).getTime()
        );
        break;
      case "price_asc":
        result = [...result].sort(
          (a, b) =>
            (a.property.asking_price || 0) - (b.property.asking_price || 0)
        );
        break;
      case "price_desc":
        result = [...result].sort(
          (a, b) =>
            (b.property.asking_price || 0) - (a.property.asking_price || 0)
        );
        break;
      case "best_match":
      default:
        // Already sorted by best score from matchProperties
        break;
    }

    return result;
  }, [allMatched, selectedBuyBox, sortBy]);

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

  async function sendMessage(
    propertyId: string,
    messageType: ActionType,
    customMessage?: string
  ) {
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

  if (buyBoxes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="w-8 h-8 text-accent" />
            Matched Listings
          </h1>
          <p className="text-muted mt-1">
            Deals that match your saved buy box criteria
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <Package className="w-16 h-16 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Buy Boxes Yet</h2>
          <p className="text-muted mb-6">
            Create a buy box with your investment criteria to see matched
            listings here.
          </p>
          <Link
            href="/my-buy-boxes"
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-medium hover:bg-accent-hover transition-colors"
          >
            <Package className="w-4 h-4" />
            Create a Buy Box
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Target className="w-8 h-8 text-accent" />
          Matched Listings
        </h1>
        <p className="text-muted mt-1">
          Deals that match your saved buy box criteria
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Buy Box Filter */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowBuyBoxFilter(!showBuyBoxFilter)}
            className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border transition-colors text-sm font-medium ${
              selectedBuyBox !== "all"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-card text-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {selectedBuyBox === "all"
                ? "All Buy Boxes"
                : buyBoxes.find((b) => b.id === selectedBuyBox)?.name ||
                  "Selected"}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showBuyBoxFilter ? "rotate-180" : ""
              }`}
            />
          </button>
          {showBuyBoxFilter && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowBuyBoxFilter(false)}
              />
              <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-lg py-1 min-w-full">
                <button
                  onClick={() => {
                    setSelectedBuyBox("all");
                    setShowBuyBoxFilter(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    selectedBuyBox === "all"
                      ? "text-accent bg-accent/10"
                      : "text-foreground hover:bg-card-hover"
                  }`}
                >
                  All Buy Boxes
                </button>
                {buyBoxes.map((box) => {
                  const matchCount = allMatched.filter((m) =>
                    m.matchedBuyBoxes.some((b) => b.buyBoxId === box.id)
                  ).length;
                  return (
                    <button
                      key={box.id}
                      onClick={() => {
                        setSelectedBuyBox(box.id);
                        setShowBuyBoxFilter(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                        selectedBuyBox === box.id
                          ? "text-accent bg-accent/10"
                          : "text-foreground hover:bg-card-hover"
                      }`}
                    >
                      <span>{box.name}</span>
                      <span className="text-xs text-muted">
                        {matchCount} {matchCount === 1 ? "match" : "matches"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-3">
          <ArrowUpDown className="w-4 h-4 text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-transparent border-none text-sm font-medium text-foreground focus:outline-none cursor-pointer"
          >
            <option value="best_match">Best Match</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-2 text-sm text-muted mb-4">
        <Sparkles className="w-4 h-4 text-accent" />
        <span>
          {filtered.length} {filtered.length === 1 ? "match" : "matches"} found
          across {buyBoxes.length}{" "}
          {buyBoxes.length === 1 ? "buy box" : "buy boxes"}
        </span>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <Target className="w-16 h-16 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Matches Yet</h2>
          <p className="text-muted mb-6">
            No current listings match your buy box criteria. New deals are added
            regularly — check back soon!
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
          >
            Browse all listings
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((match) => (
            <MatchedCard
              key={match.property.id}
              match={match}
              isSaved={savedIds.has(match.property.id)}
              sentTypes={sentMsgs[match.property.id] || []}
              isOwn={match.property.user_id === currentUserId}
              selectedBuyBox={selectedBuyBox}
              onToggleSave={() => toggleSave(match.property.id)}
              onSendMessage={(type, msg) =>
                sendMessage(match.property.id, type, msg)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MatchedCard({
  match,
  isSaved,
  sentTypes,
  isOwn,
  selectedBuyBox,
  onToggleSave,
  onSendMessage,
}: {
  match: MatchedProperty;
  isSaved: boolean;
  sentTypes: string[];
  isOwn: boolean;
  selectedBuyBox: string;
  onToggleSave: () => void;
  onSendMessage: (type: ActionType, customMessage?: string) => void;
}) {
  const [askOpen, setAskOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ActionType | null>(null);

  const property = match.property;
  const photo = property.property_photos
    ?.sort((a, b) => a.display_order - b.display_order)?.[0];

  // Show the relevant match detail
  const displayMatch =
    selectedBuyBox !== "all"
      ? match.matchedBuyBoxes.find((b) => b.buyBoxId === selectedBuyBox) ||
        match.matchedBuyBoxes[0]
      : match.matchedBuyBoxes[0];

  const hasSentShowing = sentTypes.includes("request_showing");
  const hasSentOffer = sentTypes.includes("make_offer");

  function handleActionClick(type: ActionType) {
    if (
      (type === "request_showing" && hasSentShowing) ||
      (type === "make_offer" && hasSentOffer)
    ) {
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

  const scoreColor =
    match.bestScore >= 80
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      : match.bestScore >= 60
      ? "text-amber-400 bg-amber-500/10 border-amber-500/30"
      : "text-blue-400 bg-blue-500/10 border-blue-500/30";

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-muted transition-colors group">
      {/* Photo */}
      <Link href={`/deals/${property.slug}`} className="block">
        <div className="relative aspect-[16/10] bg-background">
          {photo ? (
            <img
              src={photo.url}
              alt={property.street_address}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <Building2 className="w-12 h-12" />
            </div>
          )}
          {/* Tags overlay */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.listing_status && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                  property.listing_status === "off_market"
                    ? "bg-orange-500/80 text-white"
                    : "bg-blue-500/80 text-white"
                }`}
              >
                {property.listing_status === "off_market"
                  ? "Off Market"
                  : "Listed"}
              </span>
            )}
          </div>
          {/* Match score badge */}
          <div className="absolute top-3 right-12">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold border backdrop-blur-sm ${scoreColor}`}
            >
              {match.bestScore}% match
            </span>
          </div>
          {/* Save button */}
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
            <Heart
              className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
            />
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

        {/* Match Info */}
        {displayMatch && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted mb-1.5">
              <Target className="w-3 h-3 text-accent" />
              <span className="font-medium text-foreground">
                {displayMatch.buyBoxName}
              </span>
              <span>— {displayMatch.score}% match</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {displayMatch.reasons.map((reason) => (
                <span
                  key={reason}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/20"
                >
                  {reason}
                </span>
              ))}
            </div>
            {match.matchedBuyBoxes.length > 1 && selectedBuyBox === "all" && (
              <p className="text-[10px] text-muted mt-1">
                +{match.matchedBuyBoxes.length - 1} more buy{" "}
                {match.matchedBuyBoxes.length - 1 === 1 ? "box" : "boxes"}
              </p>
            )}
          </div>
        )}

        {/* ARV */}
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
                  You&apos;ve already{" "}
                  {confirmAction === "request_showing"
                    ? "requested a showing"
                    : "sent an offer"}
                  . Send again?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-border text-muted hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => doSend(confirmAction)}
                    disabled={sending}
                    className="flex-1 text-xs py-1.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
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
