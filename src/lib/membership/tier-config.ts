// ============================================
// Membership Tier Configuration
// All tiers, features, limits, and pricing
// ============================================

// --- Tier & Plan Types ---

export type Tier = 'free' | 'pro' | 'elite';
export type PlanType = 'buyer' | 'seller' | 'both';

export type PlanId =
  | 'free_buyer'
  | 'pro_buyer'
  | 'elite_buyer'
  | 'free_seller'
  | 'pro_seller'
  | 'elite_seller'
  | 'pro_both'
  | 'elite_both';

// --- Feature Keys ---

export type BuyerFeature =
  | 'create_account'
  | 'buyer_profile'
  | 'browse_listings'
  | 'view_listing_details'
  | 'basic_search'
  | 'basic_filters'
  | 'save_listings'
  | 'contact_seller'
  | 'in_app_notifications'
  | 'daily_digest_alerts'
  | 'instant_email_alerts'
  | 'advanced_filters'
  | 'match_feed'
  | 'saved_searches'
  | 'map_view'
  | 'private_notes'
  | 'basic_deal_pipeline'
  | 'priority_inquiry'
  | 'proof_of_funds_upload'
  | 'pro_buyer_badge'
  | 'sms_alerts'
  | 'push_notifications'
  | 'first_look_access'
  | 'premium_inventory'
  | 'verified_buyer_badge'
  | 'verified_proof_of_funds_badge'
  | 'team_seats'
  | 'shared_team_pipeline'
  | 'shared_notes'
  | 'bulk_export'
  | 'advanced_buyer_analytics'
  | 'multi_market_watchlists';

export type SellerFeature =
  | 'create_account'
  | 'seller_profile'
  | 'create_listing'
  | 'edit_listing'
  | 'save_draft'
  | 'publish_listing'
  | 'archive_listing'
  | 'mark_sold'
  | 'upload_photos'
  | 'basic_property_fields'
  | 'receive_inquiries'
  | 'basic_dashboard'
  | 'manual_share_link'
  | 'inquiry_count'
  | 'matched_buyer_count'
  | 'email_blast'
  | 'listing_analytics'
  | 'views_count'
  | 'saves_count'
  | 'inquiries_analytics'
  | 'featured_listing_badge'
  | 'branded_seller_profile'
  | 'branded_listing_page'
  | 'listing_templates'
  | 'duplicate_listing'
  | 'attachment_uploads'
  | 'inquiry_status_tracking'
  | 'basic_dispo_pipeline'
  | 'property_flyer_generation'
  | 'sms_blast'
  | 'buyer_list_import'
  | 'audience_segmentation'
  | 'vip_first_release'
  | 'timed_release_windows'
  | 'private_listings'
  | 'premium_only_listings'
  | 'advanced_analytics'
  | 'open_click_tracking'
  | 'buyer_intent_tracking'
  | 'verified_seller_badge'
  | 'seller_team_seats'
  | 'shared_team_inbox'
  | 'team_dispo_pipeline'
  | 'internal_notes_assignment'
  | 'offer_collection_tools'
  | 'deal_room';

// --- Limit Keys ---

export type BuyerLimitKey = 'max_buy_boxes' | 'max_saved_searches';
export type SellerLimitKey = 'max_active_listings';

// --- Feature Sets by Tier ---

const FREE_BUYER_FEATURES: BuyerFeature[] = [
  'create_account',
  'buyer_profile',
  'browse_listings',
  'view_listing_details',
  'basic_search',
  'basic_filters',
  'save_listings',
  'contact_seller',
  'in_app_notifications',
  'daily_digest_alerts',
];

const PRO_BUYER_FEATURES: BuyerFeature[] = [
  ...FREE_BUYER_FEATURES,
  'instant_email_alerts',
  'advanced_filters',
  'match_feed',
  'saved_searches',
  'map_view',
  'private_notes',
  'basic_deal_pipeline',
  'priority_inquiry',
  'proof_of_funds_upload',
  'pro_buyer_badge',
];

const ELITE_BUYER_FEATURES: BuyerFeature[] = [
  ...PRO_BUYER_FEATURES,
  'sms_alerts',
  'push_notifications',
  'first_look_access',
  'premium_inventory',
  'verified_buyer_badge',
  'verified_proof_of_funds_badge',
  'team_seats',
  'shared_team_pipeline',
  'shared_notes',
  'bulk_export',
  'advanced_buyer_analytics',
  'multi_market_watchlists',
];

const FREE_SELLER_FEATURES: SellerFeature[] = [
  'create_account',
  'seller_profile',
  'create_listing',
  'edit_listing',
  'save_draft',
  'publish_listing',
  'archive_listing',
  'mark_sold',
  'upload_photos',
  'basic_property_fields',
  'receive_inquiries',
  'basic_dashboard',
  'manual_share_link',
  'inquiry_count',
];

const PRO_SELLER_FEATURES: SellerFeature[] = [
  ...FREE_SELLER_FEATURES,
  'matched_buyer_count',
  'email_blast',
  'listing_analytics',
  'views_count',
  'saves_count',
  'inquiries_analytics',
  'featured_listing_badge',
  'branded_seller_profile',
  'branded_listing_page',
  'listing_templates',
  'duplicate_listing',
  'attachment_uploads',
  'inquiry_status_tracking',
  'basic_dispo_pipeline',
  'property_flyer_generation',
];

const ELITE_SELLER_FEATURES: SellerFeature[] = [
  ...PRO_SELLER_FEATURES,
  'sms_blast',
  'buyer_list_import',
  'audience_segmentation',
  'vip_first_release',
  'timed_release_windows',
  'private_listings',
  'premium_only_listings',
  'advanced_analytics',
  'open_click_tracking',
  'buyer_intent_tracking',
  'verified_seller_badge',
  'seller_team_seats',
  'shared_team_inbox',
  'team_dispo_pipeline',
  'internal_notes_assignment',
  'offer_collection_tools',
  'deal_room',
];

// --- Feature lookup maps ---

export const BUYER_FEATURES_BY_TIER: Record<Tier, ReadonlySet<BuyerFeature>> = {
  free: new Set(FREE_BUYER_FEATURES),
  pro: new Set(PRO_BUYER_FEATURES),
  elite: new Set(ELITE_BUYER_FEATURES),
};

export const SELLER_FEATURES_BY_TIER: Record<Tier, ReadonlySet<SellerFeature>> = {
  free: new Set(FREE_SELLER_FEATURES),
  pro: new Set(PRO_SELLER_FEATURES),
  elite: new Set(ELITE_SELLER_FEATURES),
};

// --- Limits by Tier ---

export const BUYER_LIMITS: Record<Tier, Record<BuyerLimitKey, number>> = {
  free: { max_buy_boxes: 1, max_saved_searches: 0 },
  pro: { max_buy_boxes: 5, max_saved_searches: 10 },
  elite: { max_buy_boxes: 999, max_saved_searches: 999 }, // effectively unlimited
};

export const SELLER_LIMITS: Record<Tier, Record<SellerLimitKey, number>> = {
  free: { max_active_listings: 1 },
  pro: { max_active_listings: 10 },
  elite: { max_active_listings: 999 }, // effectively unlimited
};

// --- Plan Definitions ---

export interface MembershipPlan {
  id: PlanId;
  name: string;
  description: string;
  planType: PlanType;
  tier: Tier;
  monthlyPriceCents: number;
}

export const MEMBERSHIP_PLANS: Record<PlanId, MembershipPlan> = {
  free_buyer: {
    id: 'free_buyer',
    name: 'Free Buyer',
    description: 'Browse deals, create one buy box, and get daily alerts.',
    planType: 'buyer',
    tier: 'free',
    monthlyPriceCents: 0,
  },
  pro_buyer: {
    id: 'pro_buyer',
    name: 'Pro Buyer',
    description: 'Instant alerts, more buy boxes, advanced filters, and better targeting.',
    planType: 'buyer',
    tier: 'pro',
    monthlyPriceCents: 2900,
  },
  elite_buyer: {
    id: 'elite_buyer',
    name: 'Elite Buyer',
    description: 'First-look access, premium inventory, team features, and advanced analytics.',
    planType: 'buyer',
    tier: 'elite',
    monthlyPriceCents: 7900,
  },
  free_seller: {
    id: 'free_seller',
    name: 'Free Seller',
    description: 'List one property and receive buyer inquiries.',
    planType: 'seller',
    tier: 'free',
    monthlyPriceCents: 0,
  },
  pro_seller: {
    id: 'pro_seller',
    name: 'Pro Seller',
    description: 'List more deals, email matched buyers, and see performance analytics.',
    planType: 'seller',
    tier: 'pro',
    monthlyPriceCents: 7900,
  },
  elite_seller: {
    id: 'elite_seller',
    name: 'Elite Seller',
    description: 'High-volume listings, SMS blasts, audience segmentation, and team tools.',
    planType: 'seller',
    tier: 'elite',
    monthlyPriceCents: 19900,
  },
  pro_both: {
    id: 'pro_both',
    name: 'Pro Both',
    description: 'Combine acquisition and dispo workflows in one account at a discount.',
    planType: 'both',
    tier: 'pro',
    monthlyPriceCents: 9900,
  },
  elite_both: {
    id: 'elite_both',
    name: 'Elite Both',
    description: 'All elite buyer and seller features in one discounted subscription.',
    planType: 'both',
    tier: 'elite',
    monthlyPriceCents: 24900,
  },
};

// --- Display Helpers ---

export const BUYER_FEATURE_LABELS: Record<BuyerFeature, string> = {
  create_account: 'Create account',
  buyer_profile: 'Buyer profile',
  browse_listings: 'Browse listings',
  view_listing_details: 'View listing details',
  basic_search: 'Basic search',
  basic_filters: 'Basic filters',
  save_listings: 'Save listings',
  contact_seller: 'Contact seller / send inquiry',
  in_app_notifications: 'In-app notifications',
  daily_digest_alerts: 'Daily digest alerts',
  instant_email_alerts: 'Instant email alerts',
  advanced_filters: 'Advanced filters',
  match_feed: 'Match feed',
  saved_searches: 'Saved searches',
  map_view: 'Map view',
  private_notes: 'Private notes on listings',
  basic_deal_pipeline: 'Basic deal pipeline',
  priority_inquiry: 'Priority inquiry placement',
  proof_of_funds_upload: 'Proof of funds upload',
  pro_buyer_badge: 'Pro buyer badge',
  sms_alerts: 'SMS alerts',
  push_notifications: 'Push notifications',
  first_look_access: 'First-look access',
  premium_inventory: 'Premium-only inventory',
  verified_buyer_badge: 'Verified buyer badge',
  verified_proof_of_funds_badge: 'Verified proof of funds badge',
  team_seats: 'Team seats',
  shared_team_pipeline: 'Shared team pipeline',
  shared_notes: 'Shared notes',
  bulk_export: 'Bulk export',
  advanced_buyer_analytics: 'Advanced buyer analytics',
  multi_market_watchlists: 'Multi-market watchlists',
};

export const SELLER_FEATURE_LABELS: Record<SellerFeature, string> = {
  create_account: 'Create account',
  seller_profile: 'Seller profile',
  create_listing: 'Create listing',
  edit_listing: 'Edit listing',
  save_draft: 'Save draft',
  publish_listing: 'Publish / unpublish listing',
  archive_listing: 'Archive listing',
  mark_sold: 'Mark sold / unavailable',
  upload_photos: 'Upload photos',
  basic_property_fields: 'Basic property fields',
  receive_inquiries: 'Receive inquiries',
  basic_dashboard: 'Basic dashboard',
  manual_share_link: 'Manual share link',
  inquiry_count: 'Inquiry count',
  matched_buyer_count: 'Matched buyer count',
  email_blast: 'Email blast to matched buyers',
  listing_analytics: 'Listing analytics',
  views_count: 'Views count',
  saves_count: 'Saves count',
  inquiries_analytics: 'Inquiries analytics',
  featured_listing_badge: 'Featured listing badge',
  branded_seller_profile: 'Branded seller profile',
  branded_listing_page: 'Branded listing page',
  listing_templates: 'Listing templates',
  duplicate_listing: 'Duplicate / clone listing',
  attachment_uploads: 'Attachment uploads',
  inquiry_status_tracking: 'Inquiry status tracking',
  basic_dispo_pipeline: 'Basic dispo pipeline',
  property_flyer_generation: 'Property flyer generation',
  sms_blast: 'SMS blast',
  buyer_list_import: 'Buyer list import',
  audience_segmentation: 'Audience segmentation',
  vip_first_release: 'VIP first release',
  timed_release_windows: 'Timed release windows',
  private_listings: 'Private listings',
  premium_only_listings: 'Premium-only listings',
  advanced_analytics: 'Advanced analytics',
  open_click_tracking: 'Open/click tracking',
  buyer_intent_tracking: 'Buyer intent tracking',
  verified_seller_badge: 'Verified seller badge',
  seller_team_seats: 'Team seats',
  shared_team_inbox: 'Shared team inbox',
  team_dispo_pipeline: 'Team dispo pipeline',
  internal_notes_assignment: 'Internal notes / assignment',
  offer_collection_tools: 'Offer collection tools',
  deal_room: 'Deal room / document vault',
};

// --- Pricing Display Helpers ---

export function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(0)}`;
}

export function formatPricePerMonth(cents: number): string {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(0)}/mo`;
}

// --- Plan grouping helpers ---

export const BUYER_PLAN_IDS: PlanId[] = ['free_buyer', 'pro_buyer', 'elite_buyer'];
export const SELLER_PLAN_IDS: PlanId[] = ['free_seller', 'pro_seller', 'elite_seller'];
export const BOTH_PLAN_IDS: PlanId[] = ['pro_both', 'elite_both'];
