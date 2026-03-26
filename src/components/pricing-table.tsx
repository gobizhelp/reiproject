"use client";

import { Check, X, Crown, Star, Zap } from "lucide-react";
import {
  MEMBERSHIP_PLANS,
  BUYER_FEATURES_BY_TIER,
  SELLER_FEATURES_BY_TIER,
  BUYER_LIMITS,
  SELLER_LIMITS,
  BUYER_FEATURE_LABELS,
  SELLER_FEATURE_LABELS,
  BUYER_PLAN_IDS,
  SELLER_PLAN_IDS,
  formatPricePerMonth,
  type PlanId,
  type Tier,
  type BuyerFeature,
  type SellerFeature,
} from "@/lib/membership/tier-config";

const TIER_ICONS: Record<Tier, typeof Star> = {
  free: Star,
  pro: Zap,
  elite: Crown,
};

const TIER_COLORS: Record<Tier, string> = {
  free: "border-gray-200",
  pro: "border-blue-500 ring-2 ring-blue-100",
  elite: "border-amber-500 ring-2 ring-amber-100",
};

const TIER_HEADER_COLORS: Record<Tier, string> = {
  free: "bg-gray-50",
  pro: "bg-blue-50",
  elite: "bg-amber-50",
};

// All buyer features in display order
const ALL_BUYER_FEATURES: BuyerFeature[] = [
  "create_account", "buyer_profile", "browse_listings", "view_listing_details",
  "basic_search", "basic_filters", "save_listings", "contact_seller",
  "in_app_notifications", "daily_digest_alerts",
  "instant_email_alerts", "advanced_filters", "match_feed", "saved_searches",
  "map_view", "private_notes", "basic_deal_pipeline", "priority_inquiry",
  "proof_of_funds_upload", "pro_buyer_badge",
  "sms_alerts", "push_notifications", "first_look_access", "premium_inventory",
  "verified_buyer_badge", "verified_proof_of_funds_badge", "team_seats",
  "shared_team_pipeline", "shared_notes", "bulk_export",
  "advanced_buyer_analytics", "multi_market_watchlists",
];

// All seller features in display order
const ALL_SELLER_FEATURES: SellerFeature[] = [
  "create_account", "seller_profile", "create_listing", "edit_listing",
  "save_draft", "publish_listing", "archive_listing", "mark_sold",
  "upload_photos", "basic_property_fields", "receive_inquiries",
  "basic_dashboard", "manual_share_link", "inquiry_count",
  "matched_buyer_count", "email_blast", "listing_analytics", "views_count",
  "saves_count", "inquiries_analytics", "featured_listing_badge",
  "branded_seller_profile", "branded_listing_page", "listing_templates",
  "duplicate_listing", "attachment_uploads", "inquiry_status_tracking",
  "basic_dispo_pipeline", "property_flyer_generation",
  "sms_blast", "buyer_list_import", "audience_segmentation",
  "vip_first_release", "timed_release_windows", "private_listings",
  "premium_only_listings", "advanced_analytics", "open_click_tracking",
  "buyer_intent_tracking", "verified_seller_badge", "seller_team_seats",
  "shared_team_inbox", "team_dispo_pipeline", "internal_notes_assignment",
  "offer_collection_tools", "deal_room",
];

function FeatureCell({ included }: { included: boolean }) {
  return included ? (
    <Check className="w-5 h-5 text-green-600 mx-auto" />
  ) : (
    <X className="w-4 h-4 text-gray-300 mx-auto" />
  );
}

function PlanHeader({ planId }: { planId: PlanId }) {
  const plan = MEMBERSHIP_PLANS[planId];
  const Icon = TIER_ICONS[plan.tier];
  return (
    <div className={`text-center p-4 rounded-t-lg ${TIER_HEADER_COLORS[plan.tier]}`}>
      <Icon className="w-6 h-6 mx-auto mb-2 text-gray-700" />
      <h3 className="font-bold text-lg">{plan.name}</h3>
      <p className="text-2xl font-bold mt-1">{formatPricePerMonth(plan.monthlyPriceCents)}</p>
      <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
    </div>
  );
}

function PricingSection({
  title,
  planIds,
  features,
  featureLabels,
  featureSets,
  limits,
  limitLabel,
}: {
  title: string;
  planIds: PlanId[];
  features: string[];
  featureLabels: Record<string, string>;
  featureSets: Record<Tier, ReadonlySet<string>>;
  limits: Record<Tier, Record<string, number>>;
  limitLabel: string;
}) {
  const plans = planIds.map((id) => MEMBERSHIP_PLANS[id]);

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 w-1/3 bg-gray-50 border-b">Feature</th>
              {plans.map((plan) => (
                <th
                  key={plan.id}
                  className={`p-0 border-b ${TIER_COLORS[plan.tier]} border-t border-l border-r rounded-t-lg`}
                >
                  <PlanHeader planId={plan.id} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Limits row */}
            <tr className="bg-blue-50/50">
              <td className="p-3 border-b font-medium">{limitLabel}</td>
              {plans.map((plan) => {
                const limitKey = Object.keys(limits[plan.tier])[0];
                const value = limits[plan.tier][limitKey];
                return (
                  <td key={plan.id} className="p-3 border-b text-center font-semibold">
                    {value >= 999 ? "Unlimited" : value === 1 ? "1" : `Up to ${value}`}
                  </td>
                );
              })}
            </tr>
            {/* Feature rows */}
            {features.map((feature, i) => (
              <tr key={feature} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className="p-3 border-b text-sm">{featureLabels[feature]}</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-3 border-b">
                    <FeatureCell included={featureSets[plan.tier].has(feature)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PricingTable() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Membership Plans</h1>
        <p className="text-gray-600">Choose the plan that fits your real estate investment strategy</p>
      </div>

      <PricingSection
        title="Buyer Plans"
        planIds={BUYER_PLAN_IDS}
        features={ALL_BUYER_FEATURES}
        featureLabels={BUYER_FEATURE_LABELS}
        featureSets={BUYER_FEATURES_BY_TIER as unknown as Record<Tier, ReadonlySet<string>>}
        limits={BUYER_LIMITS}
        limitLabel="Buy boxes allowed"
      />

      <PricingSection
        title="Seller Plans"
        planIds={SELLER_PLAN_IDS}
        features={ALL_SELLER_FEATURES}
        featureLabels={SELLER_FEATURE_LABELS}
        featureSets={SELLER_FEATURES_BY_TIER as unknown as Record<Tier, ReadonlySet<string>>}
        limits={SELLER_LIMITS}
        limitLabel="Active listings allowed"
      />

      {/* Both Plans Summary */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Combined Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(["pro_both", "elite_both"] as const).map((planId) => {
            const plan = MEMBERSHIP_PLANS[planId];
            const Icon = TIER_ICONS[plan.tier];
            return (
              <div
                key={planId}
                className={`border rounded-lg p-6 ${TIER_COLORS[plan.tier]}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className="w-6 h-6" />
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
                <p className="text-3xl font-bold mb-2">
                  {formatPricePerMonth(plan.monthlyPriceCents)}
                </p>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    All {plan.tier === "pro" ? "Pro" : "Elite"} Buyer features
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    All {plan.tier === "pro" ? "Pro" : "Elite"} Seller features
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    One combined dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    One billing subscription
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Bundle discount vs separate plans
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
