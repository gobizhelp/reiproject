"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Property, PropertyPhoto, Comp, DealAnalysis } from "@/lib/types";
import { formatCurrency, formatPercent, formatCurrencyRange } from "@/lib/calculations";
import {
  Building2, Bed, Bath, Maximize, Calendar, MapPin, Phone, Mail, User,
  ChevronLeft, ChevronRight, DollarSign, TrendingUp, Target, Info, ArrowRight,
  Tag, Home, Wrench, Star, Heart, Eye, MessageSquare, Send, X
} from "lucide-react";
import Navbar from "@/components/navbar";
import BuyerNoteEditor from "@/components/buyer-note-editor";
import ShareButton from "@/components/share-button";

interface Props {
  property: Property;
  photos: PropertyPhoto[];
  comps: Comp[];
  analysis: DealAnalysis;
  isLoggedIn?: boolean;
  isOwn?: boolean;
  isSaved?: boolean;
  existingConversationId?: string | null;
  noteContent?: string;
  hasNotesFeature?: boolean;
}

export default function DealPacketView({ property, photos, comps, analysis, isLoggedIn, isOwn, isSaved: initialSaved, existingConversationId, noteContent, hasNotesFeature }: Props) {
  const router = useRouter();
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [saved, setSaved] = useState(initialSaved || false);
  const [askOpen, setAskOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(!!existingConversationId);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const hasLightRehab = property.light_rehab_arv || property.light_rehab_budget_low;
  const hasFullRehab = property.full_rehab_arv_low || property.full_rehab_budget_low;
  const hasRentals = property.rent_after_reno_low || property.rent_after_reno_basement_low;
  const showActions = !isOwn;

  async function toggleSave() {
    if (!isLoggedIn) { router.push(`/login?redirect=/deals/${property.slug}`); return; }
    const wasSaved = saved;
    setSaved(!wasSaved);
    const res = await fetch("/api/saved-listings", {
      method: wasSaved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId: property.id }),
    });
    if (!res.ok) setSaved(wasSaved);
  }

  function formatOfferAmount(value: string): string {
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) return "";
    return num.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  async function handleMakeOffer() {
    const cleaned = offerAmount.replace(/[^0-9.]/g, "");
    if (!cleaned || isNaN(parseFloat(cleaned))) return;
    const formatted = formatOfferAmount(offerAmount);
    await handleAction("make_offer", `I'd like to make an offer of ${formatted} on this property.`);
    setOfferAmount("");
    setOfferOpen(false);
  }

  async function handleAction(type: string, customMessage?: string) {
    if (!isLoggedIn) { router.push(`/login?redirect=/deals/${property.slug}`); return; }
    if (type === "ask_question" && !customMessage) { setAskOpen(true); return; }
    if (type === "make_offer" && !customMessage) {
      if (!isLoggedIn) { router.push(`/login?redirect=/deals/${property.slug}`); return; }
      setOfferOpen(true);
      return;
    }
    // If conversation already exists for showing/offer, confirm first
    if (conversationStarted && (type === "request_showing" || type === "make_offer") && !confirmAction) {
      setConfirmAction(type);
      return;
    }
    setConfirmAction(null);
    setSending(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId: property.id,
        action: type,
        customMessage,
        shareContact: false,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setConversationStarted(true);
      setAskOpen(false);
      setQuestion("");
      router.push(`/messages/${data.conversationId}`);
    }
    setSending(false);
  }

  async function handleAskQuestion() {
    if (!question.trim()) return;
    if (!isLoggedIn) { router.push(`/login?redirect=/deals/${property.slug}`); return; }
    await handleAction("ask_question", question);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {isLoggedIn ? (
        <Navbar />
      ) : (
        <div className="bg-card border-b border-border">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-accent" />
            <span className="font-bold text-lg">REI Reach</span>
          </div>
        </div>
      )}

      {/* Seller status banner */}
      {property.seller_status === "pending" && (
        <div className="bg-warning/10 border-b border-warning/30">
          <div className="max-w-5xl mx-auto px-4 py-3 text-center text-warning font-semibold text-sm">
            This property is currently under contract (Pending)
          </div>
        </div>
      )}
      {property.seller_status === "sold" && (
        <div className="bg-accent/10 border-b border-accent/30">
          <div className="max-w-5xl mx-auto px-4 py-3 text-center text-accent font-semibold text-sm">
            This property has been sold
          </div>
        </div>
      )}

      {/* Hero - Photo Carousel */}
      {photos.length > 0 && (
        <div className="relative bg-black">
          <div className="max-w-5xl mx-auto">
            <div className="relative aspect-[16/9] md:aspect-[21/9]">
              <img
                src={photos[currentPhoto].url}
                alt={`Property photo ${currentPhoto + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPhoto((p) => (p === 0 ? photos.length - 1 : p - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentPhoto((p) => (p === photos.length - 1 ? 0 : p + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPhoto(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          i === currentPhoto ? "bg-white" : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Address overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                {property.title && (
                  <p className="text-white/90 text-sm font-medium mb-1 uppercase tracking-wide">{property.title}</p>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {property.street_address}
                </h1>
                <p className="text-white/80 text-lg flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {property.city}, {property.state} {property.zip_code}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Address (if no photos) */}
        {photos.length === 0 && (
          <div className="mb-8">
            {property.title && (
              <p className="text-muted text-sm font-medium mb-1 uppercase tracking-wide">{property.title}</p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-1">{property.street_address}</h1>
            <p className="text-muted text-lg flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {property.city}, {property.state} {property.zip_code}
            </p>
          </div>
        )}

        {/* Share button - always visible for owners and non-logged-in users (non-owners get it in the action bar) */}
        {!showActions && (
          <div className="flex mb-6">
            <ShareButton slug={property.slug} address={property.street_address} variant="full" />
          </div>
        )}

        {/* Tags Bar */}
        {(property.listing_status || property.ideal_investor_strategy) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {property.listing_status && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                property.listing_status === "off_market"
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}>
                <Tag className="w-3 h-3" />
                {property.listing_status === "off_market" ? "Off Market" : "Listed"}
              </span>
            )}
            {property.ideal_investor_strategy && property.ideal_investor_strategy.split(", ").filter(Boolean).map((strategy) => (
              <span key={strategy} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent">
                <Target className="w-3 h-3" />
                {strategy}
              </span>
            ))}
          </div>
        )}

        {/* Action Bar - shown to everyone except property owner */}
        {showActions && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <ShareButton slug={property.slug} address={property.street_address} variant="full" />
              {isLoggedIn && (
                <button
                  onClick={toggleSave}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    saved
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-card border border-border text-muted hover:text-foreground hover:border-muted"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                  {saved ? "Saved" : "Save"}
                </button>
              )}
              <button
                onClick={() => handleAction("request_showing")}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                Request Showing
              </button>
              <button
                onClick={() => handleAction("make_offer")}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 disabled:opacity-50"
              >
                <DollarSign className="w-4 h-4" />
                Make Offer
              </button>
            </div>
            {offerOpen && (
              <div className="mt-3 bg-background border border-emerald-500/30 rounded-lg p-3 space-y-2">
                <label className="text-xs font-medium text-emerald-400">Enter your offer amount</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={offerAmount}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        setOfferAmount(raw ? parseInt(raw).toLocaleString() : "");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleMakeOffer()}
                      placeholder="150,000"
                      className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleMakeOffer}
                    disabled={!offerAmount.trim() || sending}
                    className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {sending ? "Sending..." : "Submit Offer"}
                  </button>
                  <button
                    onClick={() => { setOfferOpen(false); setOfferAmount(""); }}
                    className="px-3 py-2.5 text-muted hover:text-foreground rounded-lg border border-border transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {!askOpen ? (
              <button
                onClick={() => {
                  if (!isLoggedIn) { router.push(`/login?redirect=/deals/${property.slug}`); return; }
                  setAskOpen(true);
                }}
                className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-muted hover:text-foreground py-2.5 rounded-lg border border-border hover:border-muted transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Ask a Question
              </button>
            ) : (
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
                  placeholder="Type your question..."
                  className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                  autoFocus
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || sending}
                  className="px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
            {/* Existing conversation link */}
            {conversationStarted && existingConversationId && (
              <button
                onClick={() => router.push(`/messages/${existingConversationId}`)}
                className="w-full mt-3 flex items-center justify-center gap-2 text-sm text-accent py-2.5 rounded-lg border border-accent/30 hover:bg-accent/10 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                View Conversation
              </button>
            )}
          </div>
        )}

        {/* Confirm re-send modal */}
        {confirmAction && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setConfirmAction(null)}>
            <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {confirmAction === "request_showing" ? "Request Another Showing?" : "Send Another Offer?"}
                </h3>
                <button onClick={() => setConfirmAction(null)} className="text-muted hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted mb-6">
                You&apos;ve already {confirmAction === "request_showing" ? "requested a showing" : "sent an offer"} for this property. Would you like to send again?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-2.5 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAction(confirmAction)}
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send Again"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Purchase Price" value={formatCurrency(property.asking_price)} icon={<DollarSign className="w-5 h-5" />} color="text-accent" />
          {property.light_rehab_arv ? (
            <MetricCard label="Light Rehab ARV" value={formatCurrency(property.light_rehab_arv)} icon={<TrendingUp className="w-5 h-5" />} color="text-success" />
          ) : (
            <MetricCard label="ARV" value={formatCurrency(property.arv)} icon={<TrendingUp className="w-5 h-5" />} color="text-success" />
          )}
          {property.light_rehab_budget_low ? (
            <MetricCard label="Light Rehab" value={formatCurrencyRange(property.light_rehab_budget_low, property.light_rehab_budget_high)} icon={<Wrench className="w-5 h-5" />} color="text-orange-400" />
          ) : (
            <MetricCard label="Repair Estimate" value={formatCurrency(property.repair_estimate)} icon={<Target className="w-5 h-5" />} color="text-orange-400" />
          )}
          <MetricCard label="ROI" value={formatPercent(analysis.roi)} icon={<TrendingUp className="w-5 h-5" />} color={analysis.roi >= 0 ? "text-success" : "text-danger"} />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="md:col-span-2 space-y-8">
            {/* Property Details */}
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Property Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <DetailItem icon={<Building2 className="w-4 h-4" />} label="Type" value={property.property_type} />
                {property.beds != null && <DetailItem icon={<Bed className="w-4 h-4" />} label="Beds" value={property.beds.toString()} />}
                {property.baths != null && <DetailItem icon={<Bath className="w-4 h-4" />} label="Baths" value={property.baths.toString()} />}
                {property.sqft != null && <DetailItem icon={<Maximize className="w-4 h-4" />} label="Above Grade Sqft" value={property.sqft.toLocaleString()} />}
                {property.year_built != null && <DetailItem icon={<Calendar className="w-4 h-4" />} label="Year Built" value={property.year_built.toString()} />}
                {property.lot_size && <DetailItem icon={<Maximize className="w-4 h-4" />} label="Lot Size" value={property.lot_size} />}
              </div>
              {property.basement_description && (
                <div className="mt-4 p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted mb-1">Basement</p>
                  <p className="text-sm">{property.basement_description}</p>
                </div>
              )}
            </section>

            {/* Neighborhood & Condition */}
            {(property.neighborhood_notes || property.condition_summary) && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Property Notes</h2>
                <div className="space-y-4">
                  {property.neighborhood_notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted mb-2">Neighborhood / Location</h3>
                      <p className="text-sm whitespace-pre-wrap">{property.neighborhood_notes}</p>
                    </div>
                  )}
                  {property.condition_summary && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted mb-2">Condition</h3>
                      <p className="text-sm whitespace-pre-wrap">{property.condition_summary}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Deal Analysis */}
            <section className="bg-card border border-accent/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Deal Analysis</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                  <span className="text-muted">MAO (70% Rule)</span>
                  <span className="text-xl font-bold text-accent">{formatCurrency(analysis.mao)}</span>
                </div>

                {/* Light Rehab Profit */}
                {hasLightRehab && (
                  <>
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Light Rehab Scenario</h3>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">Rehab Budget</span>
                      <span className="text-lg font-bold">{formatCurrencyRange(property.light_rehab_budget_low, property.light_rehab_budget_high)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">ARV</span>
                      <span className="text-lg font-bold text-success">{formatCurrency(property.light_rehab_arv)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">Profit Range</span>
                      <span className={`text-lg font-bold ${analysis.profitLightRehabLow >= 0 ? "text-success" : "text-danger"}`}>
                        {formatCurrencyRange(analysis.profitLightRehabLow, analysis.profitLightRehabHigh)}
                      </span>
                    </div>
                  </>
                )}

                {/* Full Rehab Profit */}
                {hasFullRehab && (
                  <>
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Full Rehab Scenario</h3>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">Rehab Budget</span>
                      <span className="text-lg font-bold">{formatCurrencyRange(property.full_rehab_budget_low, property.full_rehab_budget_high)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">ARV</span>
                      <span className="text-lg font-bold text-success">{formatCurrencyRange(property.full_rehab_arv_low, property.full_rehab_arv_high)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">Profit Range</span>
                      <span className={`text-lg font-bold ${analysis.profitFullRehabLow >= 0 ? "text-success" : "text-danger"}`}>
                        {formatCurrencyRange(analysis.profitFullRehabLow, analysis.profitFullRehabHigh)}
                      </span>
                    </div>
                  </>
                )}

                {/* Legacy single-value display (for older deal packets) */}
                {!hasLightRehab && !hasFullRehab && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">Potential Profit</span>
                      <span className={`text-xl font-bold ${analysis.potentialProfit >= 0 ? "text-success" : "text-danger"}`}>
                        {formatCurrency(analysis.potentialProfit)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">ROI</span>
                      <span className={`text-xl font-bold ${analysis.roi >= 0 ? "text-success" : "text-danger"}`}>
                        {formatPercent(analysis.roi)}
                      </span>
                    </div>
                  </>
                )}

                {property.show_assignment_fee && property.assignment_fee != null && (
                  <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                    <span className="text-muted">Assignment Fee</span>
                    <span className="text-xl font-bold">{formatCurrency(property.assignment_fee)}</span>
                  </div>
                )}
                <div className="mt-2 p-3 bg-accent/10 rounded-lg flex items-start gap-2">
                  <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <p className="text-sm text-muted">
                    MAO = ARV × 70% − Repairs{property.show_assignment_fee ? " − Assignment Fee" : ""}.
                    Profit = ARV − Purchase Price − Rehab Budget.
                  </p>
                </div>
              </div>
            </section>

            {/* Rental Projections */}
            {hasRentals && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Rental Projections</h2>
                <div className="space-y-3">
                  {(property.rent_after_reno_low || property.rent_after_reno_high) && (
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">Rent After Reno (No Basement Finish)</span>
                      <span className="text-lg font-bold">{formatCurrencyRange(property.rent_after_reno_low, property.rent_after_reno_high)}/mo</span>
                    </div>
                  )}
                  {(property.rent_after_reno_basement_low || property.rent_after_reno_basement_high) && (
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">Rent After Reno + Finished Basement</span>
                      <span className="text-lg font-bold">{formatCurrencyRange(property.rent_after_reno_basement_low, property.rent_after_reno_basement_high)}/mo</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Renovation Overview */}
            {property.renovation_overview && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-muted" />
                  Renovation Overview
                </h2>
                <ul className="space-y-2">
                  {property.renovation_overview.split("\n").filter(Boolean).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-accent mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Why This Deal Is Strong */}
            {property.why_deal_is_strong && (
              <section className="bg-card border border-accent/30 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent" />
                  Why This Deal Is Strong
                </h2>
                <ul className="space-y-2">
                  {property.why_deal_is_strong.split("\n").filter(Boolean).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-success mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Comps Summary */}
            {property.comps_summary && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Comps Summary</h2>
                <p className="text-sm whitespace-pre-wrap">{property.comps_summary}</p>
              </section>
            )}

            {/* Photo Gallery */}
            {photos.length > 1 && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.map((photo, i) => (
                    <button
                      key={photo.id}
                      onClick={() => setCurrentPhoto(i)}
                      className="rounded-lg overflow-hidden hover:ring-2 ring-accent transition-all"
                    >
                      <img src={photo.url} alt={`Photo ${i + 1}`} className="w-full h-32 object-cover" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Comps Table */}
            {comps.length > 0 && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Comparable Sales</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted">
                        <th className="text-left pb-3 font-medium">Address</th>
                        <th className="text-right pb-3 font-medium">Sale Price</th>
                        <th className="text-right pb-3 font-medium hidden sm:table-cell">Sqft</th>
                        <th className="text-right pb-3 font-medium hidden md:table-cell">Bed/Bath</th>
                        <th className="text-right pb-3 font-medium hidden sm:table-cell">Date Sold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comps.map((comp) => (
                        <tr key={comp.id} className="border-b border-border/50">
                          <td className="py-3">{comp.address}</td>
                          <td className="py-3 text-right font-medium">{formatCurrency(comp.sale_price)}</td>
                          <td className="py-3 text-right text-muted hidden sm:table-cell">{comp.sqft?.toLocaleString()}</td>
                          <td className="py-3 text-right text-muted hidden md:table-cell">
                            {comp.beds}/{comp.baths}
                          </td>
                          <td className="py-3 text-right text-muted hidden sm:table-cell">
                            {comp.date_sold ? new Date(comp.date_sold).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Showing Instructions */}
            {property.showing_instructions && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Showing Instructions</h2>
                <p className="text-muted whitespace-pre-wrap">{property.showing_instructions}</p>
              </section>
            )}

            {/* Buyer Notes - shown to logged-in non-owners */}
            {isLoggedIn && !isOwn && hasNotesFeature !== undefined && (
              <BuyerNoteEditor
                propertyId={property.id}
                initialContent={noteContent}
                hasFeature={!!hasNotesFeature}
              />
            )}

            {/* Quick Summary */}
            <section className="bg-accent/10 border border-accent/30 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Quick Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Purchase Price</span>
                  <span className="font-medium">{formatCurrency(property.asking_price)}</span>
                </div>
                {hasLightRehab && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted">Light Rehab</span>
                      <span className="font-medium">{formatCurrencyRange(property.light_rehab_budget_low, property.light_rehab_budget_high)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Light ARV</span>
                      <span className="font-medium">{formatCurrency(property.light_rehab_arv)}</span>
                    </div>
                  </>
                )}
                {hasFullRehab && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted">Full Rehab</span>
                      <span className="font-medium">{formatCurrencyRange(property.full_rehab_budget_low, property.full_rehab_budget_high)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Full ARV</span>
                      <span className="font-medium">{formatCurrencyRange(property.full_rehab_arv_low, property.full_rehab_arv_high)}</span>
                    </div>
                  </>
                )}
                {!hasLightRehab && !hasFullRehab && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted">ARV</span>
                      <span className="font-medium">{formatCurrency(property.arv)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Repairs</span>
                      <span className="font-medium">{formatCurrency(property.repair_estimate)}</span>
                    </div>
                  </>
                )}
                <hr className="border-border" />
                <div className="flex justify-between">
                  <span className="text-muted">Spread</span>
                  <span className="font-bold text-success">
                    {hasLightRehab
                      ? formatCurrency((property.light_rehab_arv || 0) - (property.asking_price || 0))
                      : formatCurrency((property.arv || 0) - (property.asking_price || 0))
                    }
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Sign Up CTA - only show for non-logged-in visitors */}
        {!isLoggedIn && (
          <section className="mt-12 bg-accent/10 border border-accent/30 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">
              Want to see more {property.contact_name ? `from ${property.contact_name}` : "properties like this"}?
            </h2>
            <p className="text-muted mb-6 max-w-lg mx-auto">
              Sign up for free to browse more off-market deals and connect with wholesalers on REI Reach.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Sign up here
              <ArrowRight className="w-4 h-4" />
            </a>
          </section>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className={`flex items-center gap-2 mb-1 ${color}`}>
        {icon}
        <span className="text-xs font-medium text-muted">{label}</span>
      </div>
      <p className={`text-xl md:text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
      <div className="text-muted">{icon}</div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
