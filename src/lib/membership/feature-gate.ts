import type { Profile } from '../profile-types';
import {
  BUYER_FEATURES_BY_TIER,
  SELLER_FEATURES_BY_TIER,
  BUYER_LIMITS,
  SELLER_LIMITS,
  type Tier,
  type BuyerFeature,
  type SellerFeature,
  type BuyerLimitKey,
  type SellerLimitKey,
} from './tier-config';

// --- Core Feature Checks ---

export function hasBuyerFeature(tier: Tier, feature: BuyerFeature): boolean {
  return BUYER_FEATURES_BY_TIER[tier].has(feature);
}

export function hasSellerFeature(tier: Tier, feature: SellerFeature): boolean {
  return SELLER_FEATURES_BY_TIER[tier].has(feature);
}

// --- Limit Checks ---

export function getBuyerLimit(tier: Tier, key: BuyerLimitKey): number {
  return BUYER_LIMITS[tier][key];
}

export function getSellerLimit(tier: Tier, key: SellerLimitKey): number {
  return SELLER_LIMITS[tier][key];
}

// --- Profile-Based Helpers ---

export function getEffectiveBuyerTier(profile: Profile): Tier {
  return profile.buyer_tier ?? 'free';
}

export function getEffectiveSellerTier(profile: Profile): Tier {
  return profile.seller_tier ?? 'free';
}

export function profileHasBuyerFeature(profile: Profile, feature: BuyerFeature): boolean {
  return hasBuyerFeature(getEffectiveBuyerTier(profile), feature);
}

export function profileHasSellerFeature(profile: Profile, feature: SellerFeature): boolean {
  return hasSellerFeature(getEffectiveSellerTier(profile), feature);
}

export function profileBuyerLimit(profile: Profile, key: BuyerLimitKey): number {
  return getBuyerLimit(getEffectiveBuyerTier(profile), key);
}

export function profileSellerLimit(profile: Profile, key: SellerLimitKey): number {
  return getSellerLimit(getEffectiveSellerTier(profile), key);
}

// --- Upgrade Helpers ---

const TIER_ORDER: Record<Tier, number> = { free: 0, pro: 1, elite: 2 };

export function isUpgrade(from: Tier, to: Tier): boolean {
  return TIER_ORDER[to] > TIER_ORDER[from];
}

export function isDowngrade(from: Tier, to: Tier): boolean {
  return TIER_ORDER[to] < TIER_ORDER[from];
}

export function getMinimumBuyerTier(feature: BuyerFeature): Tier {
  if (BUYER_FEATURES_BY_TIER.free.has(feature)) return 'free';
  if (BUYER_FEATURES_BY_TIER.pro.has(feature)) return 'pro';
  return 'elite';
}

export function getMinimumSellerTier(feature: SellerFeature): Tier {
  if (SELLER_FEATURES_BY_TIER.free.has(feature)) return 'free';
  if (SELLER_FEATURES_BY_TIER.pro.has(feature)) return 'pro';
  return 'elite';
}
