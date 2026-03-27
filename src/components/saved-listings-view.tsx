"use client";

import { useState } from "react";
import Link from "next/link";
import { Property } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import {
  Heart, MapPin, Bed, Bath, Maximize, Building2, Trash2,
  Eye, DollarSign, MessageSquare, Send
} from "lucide-react";
import BuyerNoteEditor from "@/components/buyer-note-editor";

interface SavedListingRow {
  id: string;
  property_id: string;
  created_at: string;
  properties: Property & {
    property_photos: { id: string; url: string; display_order: number }[];
  };
}

type ActionType = "request_showing" | "make_offer" | "ask_question";

interface Props {
  savedListings: SavedListingRow[];
  sentMessages: Record<string, string[]>;
  notesMap: Record<string, string>;
  hasNotesFeature: boolean;
}

export default function SavedListingsView({ savedListings: initial, sentMessages, notesMap, hasNotesFeature }: Props) {
  const [listings, setListings] = useState(initial);
  const [removing, setRemoving] = useState<string | null>(null);
  const [sentMsgs, setSentMsgs] = useState<Record<string, string[]>>(sentMessages);

  async function unsave(propertyId: string) {
    setRemoving(propertyId);
    const res = await fetch("/api/saved-listings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });

    if (res.ok) {
      setListings(listings.filter((l) => l.property_id !== propertyId));
    }
    setRemoving(null);
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
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500" />
          Saved Listings
        </h1>
        <p className="text-muted mt-1">Properties you&apos;ve saved for later</p>
      </div>

      {listings.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <Heart className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted text-lg mb-2">No saved listings yet</p>
          <p className="text-muted text-sm mb-6">
            Browse the marketplace and tap the heart icon to save deals you&apos;re interested in.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((saved) => {
            const property = saved.properties;
            if (!property) return null;

            return (
              <SavedCard
                key={saved.id}
                property={property}
                savedAt={saved.created_at}
                sentTypes={sentMsgs[property.id] || []}
                removing={removing === property.id}
                onRemove={() => unsave(property.id)}
                onSendMessage={(type, msg) => sendMessage(property.id, type, msg)}
                noteContent={notesMap[property.id] || ""}
                hasNotesFeature={hasNotesFeature}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function SavedCard({
  property,
  savedAt,
  sentTypes,
  removing,
  onRemove,
  onSendMessage,
  noteContent,
  hasNotesFeature,
}: {
  property: Property & { property_photos: { id: string; url: string; display_order: number }[] };
  savedAt: string;
  sentTypes: string[];
  removing: boolean;
  onRemove: () => void;
  onSendMessage: (type: ActionType, customMessage?: string) => void;
  noteContent: string;
  hasNotesFeature: boolean;
}) {
  const [askOpen, setAskOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ActionType | null>(null);

  const photo = property.property_photos
    ?.sort((a, b) => a.display_order - b.display_order)?.[0];

  const hasSentShowing = sentTypes.includes("request_showing");
  const hasSentOffer = sentTypes.includes("make_offer");

  function handleActionClick(type: ActionType) {
    if (type === "make_offer") {
      if (hasSentOffer) {
        setConfirmAction(type);
      } else {
        setOfferOpen(true);
      }
      return;
    }
    if (type === "request_showing" && hasSentShowing) {
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

  async function handleMakeOffer() {
    const cleaned = offerAmount.replace(/[^0-9]/g, "");
    if (!cleaned) return;
    const num = parseInt(cleaned);
    const formatted = num.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
    setSending(true);
    await onSendMessage("make_offer", `I'd like to make an offer of ${formatted} on this property.`);
    setOfferAmount("");
    setOfferOpen(false);
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
      <Link href={`/deals/${property.slug}`} className="block">
        <div className="relative aspect-[16/10] bg-background">
          {photo ? (
            <img src={photo.url} alt={property.street_address} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <Building2 className="w-12 h-12" />
            </div>
          )}
          {property.listing_status && (
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm ${
                property.listing_status === "off_market"
                  ? "bg-orange-500/80 text-white"
                  : "bg-blue-500/80 text-white"
              }`}>
                {property.listing_status === "off_market" ? "Off Market" : "Listed"}
              </span>
            </div>
          )}
          {property.asking_price && (
            <div className="absolute bottom-3 right-3">
              <span className="bg-black/70 backdrop-blur-sm text-white font-bold px-3 py-1 rounded-lg text-lg">
                {formatCurrency(property.asking_price)}
              </span>
            </div>
          )}
        </div>
      </Link>

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

        {(property.light_rehab_arv || property.arv) && (
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted">ARV</span>
            <span className="font-semibold text-success">
              {formatCurrency(property.light_rehab_arv || property.arv)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
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
          {confirmAction && (
            <div className="bg-background border border-border rounded-lg p-3 space-y-2">
              <p className="text-xs text-muted">
                You&apos;ve already {confirmAction === "request_showing" ? "requested a showing" : "sent an offer"}. {confirmAction === "make_offer" ? "Send another offer?" : "Send again?"}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmAction(null)} className="flex-1 text-xs py-1.5 rounded-lg border border-border text-muted hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button onClick={() => { setConfirmAction(null); if (confirmAction === "make_offer") { setOfferOpen(true); } else { doSend(confirmAction); } }} disabled={sending} className="flex-1 text-xs py-1.5 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
                  {confirmAction === "make_offer" ? "New Offer" : (sending ? "Sending..." : "Send Again")}
                </button>
              </div>
            </div>
          )}
          {offerOpen && (
            <div className="bg-background border border-emerald-500/30 rounded-lg p-3 space-y-2">
              <label className="text-xs font-medium text-emerald-400">Enter your offer amount</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
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
                    className="w-full bg-background border border-border rounded-lg pl-8 pr-2 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleMakeOffer}
                  disabled={!offerAmount.trim() || sending}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {sending ? "..." : <Send className="w-3.5 h-3.5" />}
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
                className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Buyer Note */}
        <BuyerNoteEditor
          propertyId={property.id}
          initialContent={noteContent}
          hasFeature={hasNotesFeature}
          compact
        />

        {/* Saved date + Remove */}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted">
            Saved {new Date(savedAt).toLocaleDateString()}
          </span>
          <button
            onClick={onRemove}
            disabled={removing}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-danger transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {removing ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}
