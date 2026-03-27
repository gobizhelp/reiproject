import type { Tier } from './membership/tier-config';

export type UserRole = 'seller' | 'buyer' | 'both';
export type ActiveView = 'seller' | 'buyer';

export interface Profile {
  id: string;
  user_role: UserRole;
  active_view: ActiveView;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  role_selected: boolean;
  is_admin: boolean;
  is_suspended: boolean;
  suspended_at: string | null;
  suspended_reason: string | null;
  buyer_tier: Tier;
  seller_tier: Tier;
  // Branded seller profile fields (Pro+)
  logo_url: string | null;
  bio: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface BuyerBuyBox {
  id: string;
  user_id: string;
  name: string;
  property_types: string[];
  locations: string | null;
  min_price: number | null;
  max_price: number | null;
  min_beds: number | null;
  min_baths: number | null;
  min_sqft: number | null;
  max_sqft: number | null;
  financing_types: string[];
  proof_of_funds: boolean | null;
  closing_timeline: string | null;
  property_conditions: string[];
  additional_notes: string | null;
  created_at: string;
  updated_at: string;
}
