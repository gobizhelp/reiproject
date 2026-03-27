"use client";

import { useState } from "react";
import { Check, Crown, Star, Zap, ArrowRight, ArrowDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MEMBERSHIP_PLANS,
  BUYER_FEATURES_BY_TIER,
  SELLER_FEATURES_BY_TIER,
  BUYER_LIMITS,
  SELLER_LIMITS,
  BUYER_FEATURE_LABELS,
  SELLER_FEATURE_LABELS,
  formatPricePerMonth,
  type PlanId,
  type Tier,
  type BuyerFeature,
  type SellerFeature,
} from "@/lib/membership/tier-config";

type RoleTab = "buyer" | "seller";

interface PricingTableProps {
  isLoggedIn?: boolean;
  buyerTier?: Tier;
  sellerTier?: Tier;
  userRole?: string;
  completedFeatures?: Record<string, boolean>;
}

// "Coming Soon" badge component
function ComingSoonBadge() {
  return (
    <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
      Coming Soon
    </span>
  );
}

// Helper to check if a feature is marked complete in the admin checklist
// Admin keys are formatted as: buyer_<feature> or seller_<feature>
function isFeatureReady(
  completedFeatures: Record<string, boolean>,
  role: RoleTab,
  featureKey: string,
): boolean {
  return !!completedFeatures[`${role}_${featureKey}`];
}

// Map card highlight strings to their primary feature key(s)
// If ANY mapped feature is incomplete, the highlight shows "Coming Soon"
const BUYER_HIGHLIGHT_FEATURES: Record<Tier, string[][]> = {
  free: [
    ["basic_search"],           // "1 buy box" (limit, always ready)
    ["browse_listings"],        // "Browse all listings"
    ["basic_search", "basic_filters"], // "Basic search & filters"
    ["save_listings"],          // "Save listings"
    ["contact_seller"],         // "Contact sellers"
    ["daily_digest_alerts"],    // "Daily digest alerts"
  ],
  pro: [
    ["basic_search"],           // "Up to 5 buy boxes" (limit, always ready)
    ["instant_email_alerts"],   // "Instant email alerts"
    ["advanced_filters", "match_feed"], // "Advanced filters & match feed"
    ["saved_searches", "map_view"], // "Saved searches & map view"
    ["basic_deal_pipeline"],    // "Deal pipeline"
    ["pro_buyer_badge"],        // "Pro buyer badge"
  ],
  elite: [
    ["basic_search"],           // "Unlimited buy boxes" (limit, always ready)
    ["first_look_access"],      // "First-look access"
    ["sms_alerts", "push_notifications"], // "SMS & push notifications"
    ["team_seats", "shared_team_pipeline"], // "Team seats & shared pipeline"
    ["bulk_export", "multi_market_watchlists"], // "Bulk export & watchlists"
  ],
};

const SELLER_HIGHLIGHT_FEATURES: Record<Tier, string[][]> = {
  free: [
    ["create_listing"],         // "1 active listing" (limit, always ready)
    ["upload_photos"],          // "Upload photos"
    ["receive_inquiries"],      // "Receive inquiries"
    ["basic_dashboard"],        // "Basic dashboard"
    ["manual_share_link"],      // "Manual share link"
    ["inquiry_count"],          // "Inquiry count"
  ],
  pro: [
    ["create_listing"],         // "Up to 10 listings" (limit, always ready)
    ["email_blast"],            // "Email blast to matched buyers"
    ["listing_analytics", "views_count"], // "Listing analytics & views"
    ["featured_listing_badge"], // "Featured listing badge"
    ["branded_seller_profile", "branded_listing_page"], // "Branded profile & pages"
    ["basic_dispo_pipeline"],   // "Dispo pipeline"
  ],
  elite: [
    ["create_listing"],         // "Unlimited listings" (limit, always ready)
    ["sms_blast", "audience_segmentation"], // "SMS blast & audience segmentation"
    ["private_listings", "premium_only_listings"], // "Private & premium-only listings"
    ["shared_team_inbox", "team_dispo_pipeline"], // "Team inbox & dispo pipeline"
    ["deal_room", "offer_collection_tools"], // "Deal room & offer tools"
  ],
};

const TIER_ICONS: Record<Tier, typeof Star> = {
  free: Star,
  pro: Zap,
  elite: Crown,
};

const TIER_ACCENT: Record<Tier, { border: string; badge: string; icon: string; glow: string }> = {
  free: {
    border: "border-border",
    badge: "bg-muted/20 text-muted",
    icon: "text-muted",
    glow: "",
  },
  pro: {
    border: "border-accent",
    badge: "bg-accent/10 text-accent",
    icon: "text-accent",
    glow: "shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]",
  },
  elite: {
    border: "border-amber-500",
    badge: "bg-amber-500/10 text-amber-400",
    icon: "text-amber-400",
    glow: "shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)]",
  },
};

const TIER_ORDER: Record<Tier, number> = { free: 0, pro: 1, elite: 2 };

const BUYER_HIGHLIGHTS: Record<Tier, string[]> = {
  free: [
    "1 buy box",
    "Browse all listings",
    "Basic search & filters",
    "Save listings",
    "Contact sellers",
    "Daily digest alerts",
  ],
  pro: [
    "Up to 5 buy boxes",
    "Instant email alerts",
    "Advanced filters & match feed",
    "Saved searches & map view",
    "Deal pipeline",
    "Pro buyer badge",
  ],
  elite: [
    "Unlimited buy boxes",
    "First-look access",
    "SMS & push notifications",
    "Team seats & shared pipeline",
    "Bulk export & watchlists",
  ],
};

const SELLER_HIGHLIGHTS: Record<Tier, string[]> = {
  free: [
    "1 active listing",
    "Upload photos",
    "Receive inquiries",
    "Basic dashboard",
    "Manual share link",
    "Inquiry count",
  ],
  pro: [
    "Up to 10 listings",
    "Email blast to matched buyers",
    "Listing analytics & views",
    "Featured listing badge",
    "Branded profile & pages",
    "Dispo pipeline",
  ],
  elite: [
    "Unlimited listings",
    "SMS blast & audience segmentation",
    "Private & premium-only listings",
    "Team inbox & dispo pipeline",
    "Deal room & offer tools",
  ],
};

const BUYER_FEATURE_GROUPS: { label: string; features: BuyerFeature[] }[] = [
  {
    label: "Discovery & Search",
    features: [
      "browse_listings", "view_listing_details", "basic_search", "basic_filters",
      "advanced_filters", "match_feed", "saved_searches", "map_view",
      "first_look_access", "multi_market_watchlists",
    ],
  },
  {
    label: "Alerts & Notifications",
    features: [
      "in_app_notifications", "daily_digest_alerts", "instant_email_alerts",
      "sms_alerts", "push_notifications",
    ],
  },
  {
    label: "Deal Management",
    features: [
      "save_listings", "contact_seller", "private_notes", "basic_deal_pipeline",
      "priority_inquiry", "bulk_export",
    ],
  },
  {
    label: "Badges & Verification",
    features: ["pro_buyer_badge"],
  },
  {
    label: "Team & Analytics",
    features: [
      "team_seats", "shared_team_pipeline", "shared_notes",
    ],
  },
];

const SELLER_FEATURE_GROUPS: { label: string; features: SellerFeature[] }[] = [
  {
    label: "Listings",
    features: [
      "create_listing", "edit_listing", "save_draft", "publish_listing",
      "archive_listing", "mark_sold", "upload_photos", "basic_property_fields",
      "listing_templates", "duplicate_listing", "attachment_uploads",
      "featured_listing_badge", "branded_listing_page", "private_listings",
      "premium_only_listings",
    ],
  },
  {
    label: "Marketing & Distribution",
    features: [
      "manual_share_link", "email_blast", "sms_blast", "buyer_list_import",
      "audience_segmentation",
    ],
  },
  {
    label: "Analytics & Tracking",
    features: [
      "inquiry_count", "matched_buyer_count", "listing_analytics", "views_count",
      "saves_count", "inquiries_analytics",
      "open_click_tracking", "buyer_intent_tracking",
    ],
  },
  {
    label: "Pipeline & Team",
    features: [
      "receive_inquiries", "inquiry_status_tracking", "basic_dispo_pipeline",
      "branded_seller_profile", "seller_team_seats",
      "shared_team_inbox", "team_dispo_pipeline", "internal_notes_assignment",
      "offer_collection_tools", "deal_room",
    ],
  },
];

// --- Confirmation Modal ---

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  loading,
  planType,
  fromTier,
  toTier,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  planType: RoleTab;
  fromTier: Tier;
  toTier: Tier;
}) {
  if (!open) return null;

  const isUpgrade = TIER_ORDER[toTier] > TIER_ORDER[fromTier];
  const isDowngrade = TIER_ORDER[toTier] < TIER_ORDER[fromTier];
  const label = planType === "buyer" ? "Buyer" : "Seller";

  const fromPlanId = `${fromTier}_${planType}` as PlanId;
  const toPlanId = `${toTier}_${planType}` as PlanId;
  const fromPlan = MEMBERSHIP_PLANS[fromPlanId];
  const toPlan = MEMBERSHIP_PLANS[toPlanId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-foreground mb-2">
          {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Change"} {label} Plan
        </h3>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 text-center">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${TIER_ACCENT[fromTier].badge}`}>
              {(() => { const Icon = TIER_ICONS[fromTier]; return <Icon className="w-4 h-4" />; })()}
              <span className="font-medium text-sm">{fromPlan.name}</span>
            </div>
            <p className="text-muted text-xs mt-1">{formatPricePerMonth(fromPlan.monthlyPriceCents)}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-muted shrink-0" />
          <div className="flex-1 text-center">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${TIER_ACCENT[toTier].badge}`}>
              {(() => { const Icon = TIER_ICONS[toTier]; return <Icon className="w-4 h-4" />; })()}
              <span className="font-medium text-sm">{toPlan.name}</span>
            </div>
            <p className="text-muted text-xs mt-1">{formatPricePerMonth(toPlan.monthlyPriceCents)}</p>
          </div>
        </div>

        {isDowngrade && (
          <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-danger/90">
              Downgrading will remove access to {fromTier === "elite" ? "Elite" : "Pro"}-tier features.
              Your data will be preserved, but some features may become unavailable.
            </p>
          </div>
        )}

        {isUpgrade && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-success/90">
              You&apos;ll get immediate access to all {toTier === "elite" ? "Elite" : "Pro"}-tier features.
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium transition-colors hover:bg-card-hover disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
              isDowngrade
                ? "bg-danger hover:bg-danger/80 text-white"
                : "bg-primary hover:bg-primary-hover text-white"
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUpgrade ? "Upgrade" : isDowngrade ? "Downgrade" : "Switch"} Plan
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Success Toast ---

function SuccessToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div className="bg-success/10 border border-success/30 rounded-xl px-5 py-3 flex items-center gap-3">
        <Check className="w-5 h-5 text-success" />
        <span className="text-sm text-foreground font-medium">{message}</span>
        <button onClick={onDismiss} className="text-muted hover:text-foreground ml-2">&times;</button>
      </div>
    </div>
  );
}

// --- Tier Card ---

function TierCard({
  planId,
  highlights,
  highlightFeatureKeys,
  popular,
  currentTier,
  isLoggedIn,
  onSelectPlan,
  completedFeatures,
  role,
}: {
  planId: PlanId;
  highlights: string[];
  highlightFeatureKeys: string[][];
  popular?: boolean;
  currentTier?: Tier;
  isLoggedIn?: boolean;
  onSelectPlan?: (tier: Tier) => void;
  completedFeatures: Record<string, boolean>;
  role: RoleTab;
}) {
  const plan = MEMBERSHIP_PLANS[planId];
  const accent = TIER_ACCENT[plan.tier];
  const Icon = TIER_ICONS[plan.tier];

  const isCurrent = currentTier === plan.tier;
  const isUpgrade = currentTier ? TIER_ORDER[plan.tier] > TIER_ORDER[currentTier] : false;
  const isDowngrade = currentTier ? TIER_ORDER[plan.tier] < TIER_ORDER[currentTier] : false;

  return (
    <div
      className={`relative bg-card border ${isCurrent ? "border-success ring-1 ring-success/30" : accent.border} rounded-2xl p-6 flex flex-col ${accent.glow} ${
        popular && !isCurrent ? "scale-[1.02]" : ""
      }`}
    >
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-success text-black text-xs font-semibold px-3 py-1 rounded-full">
            Current Plan
          </span>
        </div>
      )}
      {!isCurrent && popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${accent.badge}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
      </div>

      <div className="mb-4">
        <span className="text-4xl font-bold text-foreground">
          {plan.monthlyPriceCents === 0 ? "Free" : `$${(plan.monthlyPriceCents / 100).toFixed(0)}`}
        </span>
        {plan.monthlyPriceCents > 0 && (
          <span className="text-muted text-sm">/month</span>
        )}
      </div>

      <p className="text-muted text-sm mb-6">{plan.description}</p>

      <ul className="space-y-3 mb-8 flex-1">
        {highlights.map((feature, idx) => {
          const featureKeys = highlightFeatureKeys[idx] || [];
          const allReady = featureKeys.every((k) => isFeatureReady(completedFeatures, role, k));
          return (
            <li key={feature} className="flex items-start gap-2">
              <Check className={`w-4 h-4 mt-0.5 shrink-0 ${allReady ? "text-success" : "text-muted/50"}`} />
              <span className={`text-sm ${allReady ? "text-foreground" : "text-muted"}`}>
                {feature}
                {!allReady && <ComingSoonBadge />}
              </span>
            </li>
          );
        })}
      </ul>

      {/* CTA Button */}
      {isLoggedIn ? (
        isCurrent ? (
          <button
            disabled
            className="w-full text-center py-3 rounded-lg font-medium bg-border/50 text-muted cursor-default"
          >
            Current Plan
          </button>
        ) : isUpgrade ? (
          <button
            onClick={() => onSelectPlan?.(plan.tier)}
            className={`w-full text-center py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              plan.tier === "pro"
                ? "bg-primary hover:bg-primary-hover text-white"
                : "bg-amber-500 hover:bg-amber-600 text-black"
            }`}
          >
            Upgrade <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onSelectPlan?.(plan.tier)}
            className="w-full text-center py-3 rounded-lg font-medium transition-colors border border-border text-muted hover:text-foreground hover:bg-card-hover flex items-center justify-center gap-2"
          >
            Downgrade <ArrowDown className="w-4 h-4" />
          </button>
        )
      ) : (
        <Link
          href="/signup"
          className={`w-full text-center py-3 rounded-lg font-medium transition-colors block ${
            plan.tier === "free"
              ? "bg-border text-foreground hover:bg-muted/30"
              : plan.tier === "pro"
              ? "bg-primary hover:bg-primary-hover text-white"
              : "bg-amber-500 hover:bg-amber-600 text-black"
          }`}
        >
          {plan.tier === "free" ? "Get Started" : "Upgrade"}
        </Link>
      )}
    </div>
  );
}

// --- Feature Comparison Table ---

function FeatureComparisonTable({ role, completedFeatures }: { role: RoleTab; completedFeatures: Record<string, boolean> }) {
  const tiers: Tier[] = ["free", "pro", "elite"];
  const planIds: PlanId[] =
    role === "buyer"
      ? ["free_buyer", "pro_buyer", "elite_buyer"]
      : ["free_seller", "pro_seller", "elite_seller"];
  const featureGroups = role === "buyer" ? BUYER_FEATURE_GROUPS : SELLER_FEATURE_GROUPS;
  const featureLabels = role === "buyer" ? BUYER_FEATURE_LABELS : SELLER_FEATURE_LABELS;
  const featureSets = role === "buyer" ? BUYER_FEATURES_BY_TIER : SELLER_FEATURES_BY_TIER;
  const limits = role === "buyer" ? BUYER_LIMITS : SELLER_LIMITS;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-4 text-sm font-medium text-muted bg-card/50 rounded-tl-lg">
              Feature
            </th>
            {planIds.map((id) => {
              const plan = MEMBERSHIP_PLANS[id];
              const Icon = TIER_ICONS[plan.tier];
              return (
                <th key={id} className="p-4 text-center bg-card/50 last:rounded-tr-lg min-w-[120px]">
                  <div className="flex items-center justify-center gap-1.5">
                    <Icon className={`w-4 h-4 ${TIER_ACCENT[plan.tier].icon}`} />
                    <span className="font-semibold text-foreground text-sm">{plan.name}</span>
                  </div>
                  <div className="text-muted text-xs mt-1">
                    {formatPricePerMonth(plan.monthlyPriceCents)}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-border">
            <td className="p-4 text-sm font-medium text-foreground">
              {role === "buyer" ? "Buy boxes" : "Active listings"}
            </td>
            {tiers.map((tier) => {
              const limitKey = Object.keys(limits[tier])[0];
              const value = limits[tier][limitKey as keyof (typeof limits)[typeof tier]];
              return (
                <td key={tier} className="p-4 text-center text-sm font-semibold text-foreground">
                  {value >= 999 ? "Unlimited" : value}
                </td>
              );
            })}
          </tr>
          {role === "buyer" && (
            <tr className="border-t border-border/50">
              <td className="p-4 text-sm font-medium text-foreground">Saved searches</td>
              {tiers.map((tier) => {
                const value = BUYER_LIMITS[tier].max_saved_searches;
                return (
                  <td key={tier} className="p-4 text-center text-sm font-semibold text-foreground">
                    {value >= 999 ? "Unlimited" : value === 0 ? "—" : value}
                  </td>
                );
              })}
            </tr>
          )}
          {featureGroups.map((group) => (
            <>
              <tr key={`header-${group.label}`}>
                <td
                  colSpan={4}
                  className="p-4 pt-6 text-xs font-semibold text-muted uppercase tracking-wider"
                >
                  {group.label}
                </td>
              </tr>
              {group.features.map((feature, i) => {
                const ready = isFeatureReady(completedFeatures, role, feature);
                return (
                  <tr
                    key={feature}
                    className={`border-t border-border/30 ${i % 2 === 0 ? "" : "bg-card/30"}`}
                  >
                    <td className="p-3 pl-4 text-sm text-foreground/80">
                      <span className={ready ? "" : "text-muted"}>
                        {featureLabels[feature as keyof typeof featureLabels]}
                      </span>
                      {!ready && <ComingSoonBadge />}
                    </td>
                    {tiers.map((tier) => {
                      const included = (featureSets[tier] as ReadonlySet<string>).has(feature);
                      return (
                        <td key={tier} className="p-3 text-center">
                          {included ? (
                            ready ? (
                              <Check className="w-4 h-4 text-success mx-auto" />
                            ) : (
                              <Check className="w-4 h-4 text-muted/40 mx-auto" />
                            )
                          ) : (
                            <span className="text-border">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Main Component ---

export default function PricingTable({
  isLoggedIn = false,
  buyerTier = "free",
  sellerTier = "free",
  userRole = "buyer",
  completedFeatures = {},
}: PricingTableProps) {
  const router = useRouter();
  const defaultTab: RoleTab = userRole === "seller" ? "seller" : "buyer";
  const [activeTab, setActiveTab] = useState<RoleTab>(defaultTab);
  const [showComparison, setShowComparison] = useState(false);

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingTier, setPendingTier] = useState<Tier>("free");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const currentTier = activeTab === "buyer" ? buyerTier : sellerTier;
  const highlights = activeTab === "buyer" ? BUYER_HIGHLIGHTS : SELLER_HIGHLIGHTS;
  const highlightFeatures = activeTab === "buyer" ? BUYER_HIGHLIGHT_FEATURES : SELLER_HIGHLIGHT_FEATURES;
  const planIds: PlanId[] =
    activeTab === "buyer"
      ? ["free_buyer", "pro_buyer", "elite_buyer"]
      : ["free_seller", "pro_seller", "elite_seller"];

  function handleSelectPlan(tier: Tier) {
    setPendingTier(tier);
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_type: activeTab,
          new_tier: pendingTier,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update plan");
      }

      setConfirmOpen(false);

      const isUp = TIER_ORDER[pendingTier] > TIER_ORDER[currentTier];
      setToast(
        isUp
          ? `Upgraded to ${pendingTier.charAt(0).toUpperCase() + pendingTier.slice(1)}!`
          : `Plan changed to ${pendingTier.charAt(0).toUpperCase() + pendingTier.slice(1)}.`
      );

      // Refresh server data
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Combined plan handler
  async function handleCombinedPlan(tier: Tier) {
    setPendingTier(tier);
    // For combined plans we update both tiers sequentially
    setLoading(true);
    try {
      const buyerRes = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_type: "buyer", new_tier: tier }),
      });
      if (!buyerRes.ok) throw new Error("Failed to update buyer plan");

      const sellerRes = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_type: "seller", new_tier: tier }),
      });
      if (!sellerRes.ok) throw new Error("Failed to update seller plan");

      setToast(`Switched to ${tier.charAt(0).toUpperCase() + tier.slice(1)} Both plan!`);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
          Plans that scale with{" "}
          <span className="text-accent">your deals</span>
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          {isLoggedIn
            ? "Manage your plan below. Upgrade for more features or downgrade anytime."
            : "Start free and upgrade as your real estate business grows. All plans include a 14-day free trial."}
        </p>
      </div>

      {/* Role Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-card border border-border rounded-xl p-1 flex">
          <button
            onClick={() => setActiveTab("buyer")}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors relative ${
              activeTab === "buyer"
                ? "bg-primary text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            Buyer Plans
            {isLoggedIn && activeTab !== "buyer" && (
              <span className="ml-2 text-xs opacity-70">({buyerTier})</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("seller")}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors relative ${
              activeTab === "seller"
                ? "bg-primary text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            Seller Plans
            {isLoggedIn && activeTab !== "seller" && (
              <span className="ml-2 text-xs opacity-70">({sellerTier})</span>
            )}
          </button>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-start">
        {planIds.map((id, i) => {
          const tier = ["free", "pro", "elite"][i] as Tier;
          return (
            <TierCard
              key={id}
              planId={id}
              highlights={highlights[tier]}
              highlightFeatureKeys={highlightFeatures[tier]}
              popular={i === 1}
              currentTier={isLoggedIn ? currentTier : undefined}
              isLoggedIn={isLoggedIn}
              onSelectPlan={handleSelectPlan}
              completedFeatures={completedFeatures}
              role={activeTab}
            />
          );
        })}
      </div>

      {/* Compare Features Toggle */}
      <div className="text-center mb-8">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="text-accent hover:text-accent-hover font-medium text-sm transition-colors inline-flex items-center gap-1"
        >
          {showComparison ? "Hide" : "Compare all"} features
          <ArrowRight
            className={`w-4 h-4 transition-transform ${showComparison ? "rotate-90" : ""}`}
          />
        </button>
      </div>

      {/* Full Feature Comparison */}
      {showComparison && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-16">
          <FeatureComparisonTable role={activeTab} completedFeatures={completedFeatures} />
        </div>
      )}

      {/* Combined Plans */}
      <div className="mt-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Buy & sell? Save with a combined plan.
          </h2>
          <p className="text-muted">
            Get both buyer and seller features at a discounted bundle price.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {(["pro_both", "elite_both"] as const).map((planId) => {
            const plan = MEMBERSHIP_PLANS[planId];
            const accent = TIER_ACCENT[plan.tier];
            const Icon = TIER_ICONS[plan.tier];

            const buyerPlan =
              plan.tier === "pro"
                ? MEMBERSHIP_PLANS.pro_buyer
                : MEMBERSHIP_PLANS.elite_buyer;
            const sellerPlan =
              plan.tier === "pro"
                ? MEMBERSHIP_PLANS.pro_seller
                : MEMBERSHIP_PLANS.elite_seller;
            const separateTotal =
              buyerPlan.monthlyPriceCents + sellerPlan.monthlyPriceCents;
            const savings = separateTotal - plan.monthlyPriceCents;

            const isCombinedCurrent =
              isLoggedIn && buyerTier === plan.tier && sellerTier === plan.tier;

            return (
              <div
                key={planId}
                className={`bg-card border ${isCombinedCurrent ? "border-success ring-1 ring-success/30" : accent.border} rounded-2xl p-6 ${accent.glow}`}
              >
                {isCombinedCurrent && (
                  <div className="mb-3">
                    <span className="bg-success text-black text-xs font-semibold px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${accent.badge}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  </div>
                  {savings > 0 && (
                    <span className="bg-success/10 text-success text-xs font-semibold px-2.5 py-1 rounded-full">
                      Save ${(savings / 100).toFixed(0)}/mo
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">
                    ${(plan.monthlyPriceCents / 100).toFixed(0)}
                  </span>
                  <span className="text-muted text-sm">/month</span>
                  <div className="text-muted text-xs mt-1">
                    vs {formatPricePerMonth(separateTotal)} for separate plans
                  </div>
                </div>

                <p className="text-muted text-sm mb-6">{plan.description}</p>

                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success shrink-0" />
                    <span className="text-sm text-foreground">
                      All {plan.tier === "pro" ? "Pro" : "Elite"} Buyer features
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success shrink-0" />
                    <span className="text-sm text-foreground">
                      All {plan.tier === "pro" ? "Pro" : "Elite"} Seller features
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success shrink-0" />
                    <span className="text-sm text-foreground">One unified dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success shrink-0" />
                    <span className="text-sm text-foreground">Single billing subscription</span>
                  </li>
                </ul>

                {isLoggedIn ? (
                  isCombinedCurrent ? (
                    <button
                      disabled
                      className="block w-full text-center py-3 rounded-lg font-medium bg-border/50 text-muted cursor-default"
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCombinedPlan(plan.tier)}
                      disabled={loading}
                      className={`block w-full text-center py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                        plan.tier === "pro"
                          ? "bg-primary hover:bg-primary-hover text-white"
                          : "bg-amber-500 hover:bg-amber-600 text-black"
                      }`}
                    >
                      {loading && pendingTier === plan.tier ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : null}
                      {isCombinedCurrent
                        ? "Current Plan"
                        : buyerTier === plan.tier && sellerTier === plan.tier
                        ? "Current Plan"
                        : `Get ${plan.name}`}
                    </button>
                  )
                ) : (
                  <Link
                    href="/signup"
                    className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${
                      plan.tier === "pro"
                        ? "bg-primary hover:bg-primary-hover text-white"
                        : "bg-amber-500 hover:bg-amber-600 text-black"
                    }`}
                  >
                    Get {plan.name}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ / CTA */}
      <div className="mt-20 text-center">
        <p className="text-muted text-sm">
          Questions?{" "}
          <Link href="/login" className="text-accent hover:text-accent-hover transition-colors">
            Contact us
          </Link>{" "}
          — we&apos;re happy to help you choose the right plan.
        </p>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        loading={loading}
        planType={activeTab}
        fromTier={currentTier}
        toTier={pendingTier}
      />

      {/* Success Toast */}
      {toast && (
        <SuccessToast message={toast} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
