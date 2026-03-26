"use client";

import { useState } from "react";
import { Check, Crown, Star, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
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

// Key features to highlight on cards (subset of all features)
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
    "Premium-only inventory",
    "SMS & push notifications",
    "Team seats & shared pipeline",
    "Advanced analytics",
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
    "VIP first release",
    "Private & premium-only listings",
    "Team inbox & dispo pipeline",
    "Deal room & offer tools",
  ],
};

// Exhaustive feature lists for detail sections
const BUYER_FEATURE_GROUPS: { label: string; features: BuyerFeature[] }[] = [
  {
    label: "Discovery & Search",
    features: [
      "browse_listings", "view_listing_details", "basic_search", "basic_filters",
      "advanced_filters", "match_feed", "saved_searches", "map_view",
      "first_look_access", "premium_inventory", "multi_market_watchlists",
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
      "priority_inquiry", "proof_of_funds_upload", "bulk_export",
    ],
  },
  {
    label: "Badges & Verification",
    features: ["pro_buyer_badge", "verified_buyer_badge", "verified_proof_of_funds_badge"],
  },
  {
    label: "Team & Analytics",
    features: [
      "team_seats", "shared_team_pipeline", "shared_notes", "advanced_buyer_analytics",
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
      "audience_segmentation", "vip_first_release", "timed_release_windows",
      "property_flyer_generation",
    ],
  },
  {
    label: "Analytics & Tracking",
    features: [
      "inquiry_count", "matched_buyer_count", "listing_analytics", "views_count",
      "saves_count", "inquiries_analytics", "advanced_analytics",
      "open_click_tracking", "buyer_intent_tracking",
    ],
  },
  {
    label: "Pipeline & Team",
    features: [
      "receive_inquiries", "inquiry_status_tracking", "basic_dispo_pipeline",
      "branded_seller_profile", "verified_seller_badge", "seller_team_seats",
      "shared_team_inbox", "team_dispo_pipeline", "internal_notes_assignment",
      "offer_collection_tools", "deal_room",
    ],
  },
];

function TierCard({
  planId,
  highlights,
  popular,
}: {
  planId: PlanId;
  highlights: string[];
  popular?: boolean;
}) {
  const plan = MEMBERSHIP_PLANS[planId];
  const accent = TIER_ACCENT[plan.tier];
  const Icon = TIER_ICONS[plan.tier];

  return (
    <div
      className={`relative bg-card border ${accent.border} rounded-2xl p-6 flex flex-col ${accent.glow} ${
        popular ? "scale-[1.02]" : ""
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${accent.badge}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
        </div>
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
        {highlights.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <span className="text-sm text-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/signup"
        className={`w-full text-center py-3 rounded-lg font-medium transition-colors ${
          plan.tier === "free"
            ? "bg-border text-foreground hover:bg-muted/30"
            : plan.tier === "pro"
            ? "bg-accent hover:bg-accent-hover text-white"
            : "bg-amber-500 hover:bg-amber-600 text-black"
        }`}
      >
        {plan.tier === "free" ? "Get Started" : "Upgrade"}
      </Link>
    </div>
  );
}

function FeatureComparisonTable({ role }: { role: RoleTab }) {
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
          {/* Limits row */}
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
          {/* Feature groups */}
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
              {group.features.map((feature, i) => (
                <tr
                  key={feature}
                  className={`border-t border-border/30 ${i % 2 === 0 ? "" : "bg-card/30"}`}
                >
                  <td className="p-3 pl-4 text-sm text-foreground/80">
                    {featureLabels[feature as keyof typeof featureLabels]}
                  </td>
                  {tiers.map((tier) => {
                    const included = (featureSets[tier] as ReadonlySet<string>).has(feature);
                    return (
                      <td key={tier} className="p-3 text-center">
                        {included ? (
                          <Check className="w-4 h-4 text-success mx-auto" />
                        ) : (
                          <span className="text-border">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PricingTable() {
  const [activeTab, setActiveTab] = useState<RoleTab>("buyer");
  const [showComparison, setShowComparison] = useState(false);

  const highlights = activeTab === "buyer" ? BUYER_HIGHLIGHTS : SELLER_HIGHLIGHTS;
  const planIds: PlanId[] =
    activeTab === "buyer"
      ? ["free_buyer", "pro_buyer", "elite_buyer"]
      : ["free_seller", "pro_seller", "elite_seller"];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
          Plans that scale with{" "}
          <span className="text-accent">your deals</span>
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          Start free and upgrade as your real estate business grows.
          All plans include a 14-day free trial.
        </p>
      </div>

      {/* Role Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-card border border-border rounded-xl p-1 flex">
          <button
            onClick={() => setActiveTab("buyer")}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "buyer"
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            Buyer Plans
          </button>
          <button
            onClick={() => setActiveTab("seller")}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "seller"
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            Seller Plans
          </button>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-start">
        {planIds.map((id, i) => (
          <TierCard
            key={id}
            planId={id}
            highlights={highlights[["free", "pro", "elite"][i] as Tier]}
            popular={i === 1}
          />
        ))}
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
          <FeatureComparisonTable role={activeTab} />
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

            // Calculate savings
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

            return (
              <div
                key={planId}
                className={`bg-card border ${accent.border} rounded-2xl p-6 ${accent.glow}`}
              >
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

                <Link
                  href="/signup"
                  className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${
                    plan.tier === "pro"
                      ? "bg-accent hover:bg-accent-hover text-white"
                      : "bg-amber-500 hover:bg-amber-600 text-black"
                  }`}
                >
                  Get {plan.name}
                </Link>
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
    </div>
  );
}
