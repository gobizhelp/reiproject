'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Loader2,
  Cloud,
  CloudOff,
} from 'lucide-react';
import {
  BUYER_FEATURE_LABELS,
  SELLER_FEATURE_LABELS,
  type BuyerFeature,
  type SellerFeature,
  type Tier,
} from '@/lib/membership/tier-config';

// --- Feature tier assignments (which tier introduces each feature) ---

const BUYER_TIER_MAP: Record<BuyerFeature, Tier> = {
  create_account: 'free',
  buyer_profile: 'free',
  browse_listings: 'free',
  view_listing_details: 'free',
  basic_search: 'free',
  basic_filters: 'free',
  save_listings: 'free',
  contact_seller: 'free',
  in_app_notifications: 'free',
  daily_digest_alerts: 'free',
  instant_email_alerts: 'pro',
  advanced_filters: 'pro',
  match_feed: 'pro',
  saved_searches: 'pro',
  map_view: 'pro',
  private_notes: 'pro',
  basic_deal_pipeline: 'pro',
  priority_inquiry: 'pro',
  pro_buyer_badge: 'pro',
  sms_alerts: 'elite',
  push_notifications: 'elite',
  first_look_access: 'elite',
  team_seats: 'elite',
  shared_team_pipeline: 'elite',
  shared_notes: 'elite',
  bulk_export: 'elite',
  multi_market_watchlists: 'elite',
};

const SELLER_TIER_MAP: Record<SellerFeature, Tier> = {
  create_account: 'free',
  seller_profile: 'free',
  create_listing: 'free',
  edit_listing: 'free',
  save_draft: 'free',
  publish_listing: 'free',
  archive_listing: 'free',
  mark_sold: 'free',
  upload_photos: 'free',
  basic_property_fields: 'free',
  receive_inquiries: 'free',
  basic_dashboard: 'free',
  manual_share_link: 'free',
  inquiry_count: 'free',
  matched_buyer_count: 'pro',
  email_blast: 'pro',
  listing_analytics: 'pro',
  views_count: 'pro',
  saves_count: 'pro',
  inquiries_analytics: 'pro',
  featured_listing_badge: 'pro',
  branded_seller_profile: 'pro',
  branded_listing_page: 'pro',
  listing_templates: 'pro',
  duplicate_listing: 'pro',
  attachment_uploads: 'pro',
  inquiry_status_tracking: 'pro',
  basic_dispo_pipeline: 'pro',
  sms_blast: 'elite',
  buyer_list_import: 'elite',
  audience_segmentation: 'elite',
  private_listings: 'elite',
  premium_only_listings: 'elite',
  open_click_tracking: 'elite',
  buyer_intent_tracking: 'elite',
  seller_team_seats: 'elite',
  shared_team_inbox: 'elite',
  team_dispo_pipeline: 'elite',
  internal_notes_assignment: 'elite',
  offer_collection_tools: 'elite',
  deal_room: 'elite',
};

const TIER_COLORS: Record<Tier, { bg: string; text: string; badge: string }> = {
  free: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', badge: 'bg-emerald-500/20 text-emerald-400' },
  pro: { bg: 'bg-blue-500/10', text: 'text-blue-500', badge: 'bg-blue-500/20 text-blue-400' },
  elite: { bg: 'bg-purple-500/10', text: 'text-purple-500', badge: 'bg-purple-500/20 text-purple-400' },
};

type ChecklistState = Record<string, boolean>;
type NotesState = Record<string, string>;

type Filter = 'all' | 'done' | 'pending' | 'flagged';

export default function AdminFeatureChecklist() {
  const [checked, setChecked] = useState<ChecklistState>({});
  const [notes, setNotes] = useState<NotesState>({});
  const [flagged, setFlagged] = useState<ChecklistState>({});
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    buyer_free: true,
    buyer_pro: true,
    buyer_elite: true,
    seller_free: true,
    seller_pro: true,
    seller_elite: true,
  });
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load state from server on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/feature-checklist');
        if (res.ok) {
          const data = await res.json();
          setChecked(data.checked ?? {});
          setNotes(data.notes ?? {});
          setFlagged(data.flagged ?? {});
        }
      } catch {
        // fall through — start with empty state
      }
      setLoaded(true);
    }
    load();
  }, []);

  // Debounced save to server
  const persistToServer = useCallback(
    (nextChecked: ChecklistState, nextNotes: NotesState, nextFlagged: ChecklistState) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      setSaveError(false);
      saveTimer.current = setTimeout(async () => {
        setSaving(true);
        try {
          const res = await fetch('/api/admin/feature-checklist', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checked: nextChecked, notes: nextNotes, flagged: nextFlagged }),
          });
          if (!res.ok) setSaveError(true);
        } catch {
          setSaveError(true);
        }
        setSaving(false);
      }, 600);
    },
    [],
  );

  // Auto-save whenever state changes (after initial load)
  useEffect(() => {
    if (loaded) persistToServer(checked, notes, flagged);
  }, [checked, notes, flagged, loaded, persistToServer]);

  const toggle = (key: string) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleFlag = (key: string) => setFlagged((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleSection = (key: string) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const resetAll = () => {
    if (confirm('Reset all checkmarks, flags, and notes? This cannot be undone.')) {
      setChecked({});
      setNotes({});
      setFlagged({});
    }
  };

  // --- Build feature lists grouped by role + tier ---

  type FeatureItem = { key: string; label: string; tier: Tier };

  function buildGroup(
    labels: Record<string, string>,
    tierMap: Record<string, Tier>,
    prefix: string,
    tier: Tier,
  ): FeatureItem[] {
    return Object.entries(tierMap)
      .filter(([, t]) => t === tier)
      .map(([key]) => ({ key: `${prefix}_${key}`, label: labels[key], tier }));
  }

  const sections: { id: string; title: string; tier: Tier; role: string; items: FeatureItem[] }[] = [
    { id: 'buyer_free', title: 'Buyer - Free', tier: 'free', role: 'buyer', items: buildGroup(BUYER_FEATURE_LABELS, BUYER_TIER_MAP, 'buyer', 'free') },
    { id: 'buyer_pro', title: 'Buyer - Pro', tier: 'pro', role: 'buyer', items: buildGroup(BUYER_FEATURE_LABELS, BUYER_TIER_MAP, 'buyer', 'pro') },
    { id: 'buyer_elite', title: 'Buyer - Elite', tier: 'elite', role: 'buyer', items: buildGroup(BUYER_FEATURE_LABELS, BUYER_TIER_MAP, 'buyer', 'elite') },
    { id: 'seller_free', title: 'Seller - Free', tier: 'free', role: 'seller', items: buildGroup(SELLER_FEATURE_LABELS, SELLER_TIER_MAP, 'seller', 'free') },
    { id: 'seller_pro', title: 'Seller - Pro', tier: 'pro', role: 'seller', items: buildGroup(SELLER_FEATURE_LABELS, SELLER_TIER_MAP, 'seller', 'pro') },
    { id: 'seller_elite', title: 'Seller - Elite', tier: 'elite', role: 'seller', items: buildGroup(SELLER_FEATURE_LABELS, SELLER_TIER_MAP, 'seller', 'elite') },
  ];

  // --- Stats ---

  const allItems = sections.flatMap((s) => s.items);
  const totalCount = allItems.length;
  const doneCount = allItems.filter((i) => checked[i.key]).length;
  const flaggedCount = allItems.filter((i) => flagged[i.key]).length;
  const pendingCount = totalCount - doneCount;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // --- Filter logic ---

  function filterItems(items: FeatureItem[]): FeatureItem[] {
    if (filter === 'done') return items.filter((i) => checked[i.key]);
    if (filter === 'pending') return items.filter((i) => !checked[i.key]);
    if (filter === 'flagged') return items.filter((i) => flagged[i.key]);
    return items;
  }

  if (!loaded) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-card rounded w-64" />
        <div className="h-4 bg-card rounded w-96" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-card border border-border rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Feature Launch Checklist</h1>
          {saving && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          )}
          {!saving && !saveError && loaded && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Cloud className="w-3 h-3" /> Saved
            </span>
          )}
          {saveError && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <CloudOff className="w-3 h-3" /> Save failed
            </span>
          )}
        </div>
        <button
          onClick={resetAll}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-danger transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All
        </button>
      </div>
      <p className="text-sm text-muted mb-6">
        Verify each feature is built and assigned to the correct tier before launch.
      </p>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {doneCount} of {totalCount} features verified
          </span>
          <span className="text-sm font-bold text-orange-500">{pct}%</span>
        </div>
        <div className="w-full h-3 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-success" /> {doneCount} done
          </span>
          <span className="flex items-center gap-1">
            <Circle className="w-3 h-3" /> {pendingCount} pending
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-yellow-500" /> {flaggedCount} flagged for review
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {(['all', 'pending', 'done', 'flagged'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-orange-500/10 text-orange-500'
                : 'text-muted hover:text-foreground hover:bg-card-hover'
            }`}
          >
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : f === 'done' ? 'Done' : 'Flagged'}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const items = filterItems(section.items);
          const sectionDone = section.items.filter((i) => checked[i.key]).length;
          const sectionTotal = section.items.length;
          const colors = TIER_COLORS[section.tier];
          const isExpanded = expandedSections[section.id];

          if (filter !== 'all' && items.length === 0) return null;

          return (
            <div key={section.id} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-card-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted" />
                  )}
                  <h2 className="text-base font-semibold">{section.title}</h2>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}>
                    {section.tier.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-muted">
                  {sectionDone}/{sectionTotal}
                  {sectionDone === sectionTotal && sectionTotal > 0 && (
                    <CheckCircle2 className="w-4 h-4 text-success inline ml-2" />
                  )}
                </span>
              </button>

              {/* Feature rows */}
              {isExpanded && (
                <div className="border-t border-border">
                  {items.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-muted italic">
                      No features match this filter.
                    </p>
                  ) : (
                    items.map((item) => {
                      const isDone = checked[item.key];
                      const isFlagged = flagged[item.key];
                      const note = notes[item.key] || '';
                      const isEditingThis = editingNote === item.key;

                      return (
                        <div
                          key={item.key}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 transition-colors ${
                            isDone ? 'bg-success/5' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => toggle(item.key)}
                            className="mt-0.5 shrink-0"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted hover:text-foreground" />
                            )}
                          </button>

                          {/* Label + note */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm ${isDone ? 'line-through text-muted' : ''}`}
                              >
                                {item.label}
                              </span>
                              <span className="text-xs text-muted font-mono">
                                {item.key.replace(/^(buyer|seller)_/, '')}
                              </span>
                            </div>

                            {/* Note display / edit */}
                            {isEditingThis ? (
                              <div className="mt-1.5 flex gap-2">
                                <input
                                  autoFocus
                                  className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs focus:outline-none focus:border-accent"
                                  placeholder="Add a note (e.g. wrong tier, needs work, etc.)"
                                  value={note}
                                  onChange={(e) =>
                                    setNotes((prev) => ({ ...prev, [item.key]: e.target.value }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') setEditingNote(null);
                                  }}
                                />
                                <button
                                  onClick={() => setEditingNote(null)}
                                  className="text-xs text-accent hover:underline"
                                >
                                  Save
                                </button>
                              </div>
                            ) : note ? (
                              <button
                                onClick={() => setEditingNote(item.key)}
                                className="mt-0.5 text-xs text-muted hover:text-foreground italic"
                              >
                                {note}
                              </button>
                            ) : null}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => toggleFlag(item.key)}
                              title={isFlagged ? 'Remove flag' : 'Flag for tier review'}
                              className={`p-1 rounded transition-colors ${
                                isFlagged
                                  ? 'text-yellow-500 bg-yellow-500/10'
                                  : 'text-muted hover:text-yellow-500'
                              }`}
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setEditingNote(editingNote === item.key ? null : item.key)
                              }
                              title="Add note"
                              className="p-1 rounded text-muted hover:text-foreground transition-colors text-xs"
                            >
                              Note
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
