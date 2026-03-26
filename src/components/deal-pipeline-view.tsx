"use client";

import { useState } from "react";
import Link from "next/link";
import { Property, DealStage } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import {
  Bookmark, Search, Phone, XCircle, Building2, MapPin,
  Bed, Bath, Maximize, ChevronRight, GripVertical, Trash2,
  StickyNote, Plus, Lock
} from "lucide-react";

interface DealStageRow {
  id: string;
  user_id: string;
  property_id: string;
  stage: DealStage;
  notes: string | null;
  created_at: string;
  updated_at: string;
  properties: Property & {
    property_photos: { id: string; url: string; display_order: number }[];
  };
}

const STAGES: { key: DealStage; label: string; icon: typeof Bookmark; color: string; bgColor: string; borderColor: string }[] = [
  { key: "saved", label: "Saved", icon: Bookmark, color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
  { key: "reviewing", label: "Reviewing", icon: Search, color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30" },
  { key: "contacted", label: "Contacted", icon: Phone, color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/30" },
  { key: "passed", label: "Passed", icon: XCircle, color: "text-zinc-400", bgColor: "bg-zinc-500/10", borderColor: "border-zinc-500/30" },
];

interface Props {
  dealStages: DealStageRow[];
  hasFeature: boolean;
}

export default function DealPipelineView({ dealStages: initial, hasFeature }: Props) {
  const [deals, setDeals] = useState(initial);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  if (!hasFeature) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GripVertical className="w-8 h-8 text-accent" />
            Deal Pipeline
          </h1>
          <p className="text-muted mt-1">Organize deals into stages to track your progress</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <Lock className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Pro Feature</p>
          <p className="text-muted text-sm mb-6">
            Upgrade to Buyer Pro to organize deals into stages like Saved, Reviewing, Contacted, or Passed.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </div>
    );
  }

  const dealsByStage = STAGES.reduce((acc, s) => {
    acc[s.key] = deals.filter((d) => d.stage === s.key);
    return acc;
  }, {} as Record<DealStage, DealStageRow[]>);

  async function moveToStage(propertyId: string, newStage: DealStage) {
    setMovingId(propertyId);
    const prev = [...deals];
    setDeals(deals.map((d) => d.property_id === propertyId ? { ...d, stage: newStage, updated_at: new Date().toISOString() } : d));

    const res = await fetch("/api/deal-stages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, stage: newStage }),
    });

    if (!res.ok) {
      setDeals(prev);
    }
    setMovingId(null);
  }

  async function removeFromPipeline(propertyId: string) {
    const prev = [...deals];
    setDeals(deals.filter((d) => d.property_id !== propertyId));

    const res = await fetch("/api/deal-stages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });

    if (!res.ok) {
      setDeals(prev);
    }
  }

  function startEditNotes(deal: DealStageRow) {
    setEditingNotes(deal.property_id);
    setNotesText(deal.notes || "");
  }

  async function saveNotes(propertyId: string) {
    setSavingNotes(true);
    const res = await fetch("/api/deal-stages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, notes: notesText }),
    });

    if (res.ok) {
      setDeals(deals.map((d) => d.property_id === propertyId ? { ...d, notes: notesText } : d));
    }
    setEditingNotes(null);
    setNotesText("");
    setSavingNotes(false);
  }

  const totalDeals = deals.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GripVertical className="w-8 h-8 text-accent" />
            Deal Pipeline
          </h1>
          <p className="text-muted mt-1">
            {totalDeals} {totalDeals === 1 ? "deal" : "deals"} in your pipeline
          </p>
        </div>
        <Link
          href="/marketplace"
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Find Deals
        </Link>
      </div>

      {totalDeals === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <GripVertical className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted text-lg mb-2">Your pipeline is empty</p>
          <p className="text-muted text-sm mb-6">
            Add deals from the marketplace to start tracking them through your pipeline.
          </p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAGES.map((stageInfo) => {
            const stageDeals = dealsByStage[stageInfo.key];
            const Icon = stageInfo.icon;
            return (
              <div key={stageInfo.key} className="space-y-3">
                {/* Stage Header */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${stageInfo.bgColor} border ${stageInfo.borderColor}`}>
                  <Icon className={`w-4 h-4 ${stageInfo.color}`} />
                  <span className={`text-sm font-semibold ${stageInfo.color}`}>{stageInfo.label}</span>
                  <span className={`ml-auto text-xs font-medium ${stageInfo.color} opacity-70`}>
                    {stageDeals.length}
                  </span>
                </div>

                {/* Deal Cards */}
                <div className="space-y-3 min-h-[100px]">
                  {stageDeals.length === 0 && (
                    <div className="border border-dashed border-border rounded-xl p-6 text-center">
                      <p className="text-xs text-muted">No deals</p>
                    </div>
                  )}
                  {stageDeals.map((deal) => (
                    <PipelineCard
                      key={deal.id}
                      deal={deal}
                      currentStage={stageInfo.key}
                      moving={movingId === deal.property_id}
                      editingNotes={editingNotes === deal.property_id}
                      notesText={notesText}
                      savingNotes={savingNotes}
                      onMove={moveToStage}
                      onRemove={removeFromPipeline}
                      onStartEditNotes={() => startEditNotes(deal)}
                      onNotesChange={setNotesText}
                      onSaveNotes={() => saveNotes(deal.property_id)}
                      onCancelNotes={() => { setEditingNotes(null); setNotesText(""); }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PipelineCard({
  deal,
  currentStage,
  moving,
  editingNotes,
  notesText,
  savingNotes,
  onMove,
  onRemove,
  onStartEditNotes,
  onNotesChange,
  onSaveNotes,
  onCancelNotes,
}: {
  deal: DealStageRow;
  currentStage: DealStage;
  moving: boolean;
  editingNotes: boolean;
  notesText: string;
  savingNotes: boolean;
  onMove: (propertyId: string, stage: DealStage) => void;
  onRemove: (propertyId: string) => void;
  onStartEditNotes: () => void;
  onNotesChange: (text: string) => void;
  onSaveNotes: () => void;
  onCancelNotes: () => void;
}) {
  const property = deal.properties;
  if (!property) return null;

  const photo = property.property_photos
    ?.sort((a, b) => a.display_order - b.display_order)?.[0];

  const otherStages = STAGES.filter((s) => s.key !== currentStage);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-muted transition-colors">
      {/* Photo + Price */}
      <Link href={`/deals/${property.slug}`} className="block">
        <div className="relative aspect-[16/9] bg-background">
          {photo ? (
            <img src={photo.url} alt={property.street_address} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <Building2 className="w-8 h-8" />
            </div>
          )}
          {property.asking_price && (
            <div className="absolute bottom-2 right-2">
              <span className="bg-black/70 backdrop-blur-sm text-white font-bold px-2 py-0.5 rounded text-sm">
                {formatCurrency(property.asking_price)}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-3 space-y-2">
        {/* Address */}
        <Link href={`/deals/${property.slug}`}>
          <h3 className="font-semibold text-sm hover:text-accent transition-colors truncate">
            {property.street_address}
          </h3>
        </Link>
        <p className="text-muted text-xs flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {property.city}, {property.state}
        </p>

        {/* Property Info */}
        <div className="flex items-center gap-3 text-xs text-muted">
          {property.beds != null && (
            <span className="flex items-center gap-0.5">
              <Bed className="w-3 h-3" /> {property.beds}
            </span>
          )}
          {property.baths != null && (
            <span className="flex items-center gap-0.5">
              <Bath className="w-3 h-3" /> {property.baths}
            </span>
          )}
          {property.sqft != null && (
            <span className="flex items-center gap-0.5">
              <Maximize className="w-3 h-3" /> {property.sqft.toLocaleString()}
            </span>
          )}
        </div>

        {/* Notes */}
        {deal.notes && !editingNotes && (
          <div
            className="bg-background border border-border rounded-lg p-2 text-xs text-muted cursor-pointer hover:border-muted transition-colors"
            onClick={onStartEditNotes}
          >
            <StickyNote className="w-3 h-3 inline mr-1" />
            {deal.notes}
          </div>
        )}

        {editingNotes && (
          <div className="space-y-1.5">
            <textarea
              value={notesText}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add notes..."
              rows={2}
              className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              autoFocus
            />
            <div className="flex gap-1.5">
              <button
                onClick={onCancelNotes}
                className="flex-1 text-xs py-1 rounded border border-border text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSaveNotes}
                disabled={savingNotes}
                className="flex-1 text-xs py-1 rounded bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {savingNotes ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* Move Actions */}
        <div className="pt-2 border-t border-border space-y-1.5">
          <div className="flex flex-wrap gap-1">
            {otherStages.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.key}
                  onClick={() => onMove(deal.property_id, s.key)}
                  disabled={moving}
                  className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-colors ${s.bgColor} ${s.color} border ${s.borderColor} hover:opacity-80 disabled:opacity-50`}
                >
                  <Icon className="w-3 h-3" />
                  {s.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            {!editingNotes && (
              <button
                onClick={onStartEditNotes}
                className="flex items-center gap-1 text-[11px] text-muted hover:text-foreground transition-colors"
              >
                <StickyNote className="w-3 h-3" />
                {deal.notes ? "Edit" : "Note"}
              </button>
            )}
            <button
              onClick={() => onRemove(deal.property_id)}
              className="flex items-center gap-1 text-[11px] text-muted hover:text-danger transition-colors ml-auto"
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
