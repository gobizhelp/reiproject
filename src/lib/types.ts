export interface Property {
  id: string;
  user_id: string;
  slug: string;
  status: 'draft' | 'published';
  // Title & Address
  title: string | null;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  // Property Info
  listing_status: string | null;
  ideal_investor_strategy: string | null;
  property_type: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  year_built: number | null;
  lot_size: string | null;
  basement_description: string | null;
  neighborhood_notes: string | null;
  condition_summary: string | null;
  comps_summary: string | null;
  // Financials
  asking_price: number | null;
  arv: number | null;
  repair_estimate: number | null;
  assignment_fee: number | null;
  show_assignment_fee: boolean;
  light_rehab_budget_low: number | null;
  light_rehab_budget_high: number | null;
  full_rehab_budget_low: number | null;
  full_rehab_budget_high: number | null;
  light_rehab_arv: number | null;
  full_rehab_arv_low: number | null;
  full_rehab_arv_high: number | null;
  // Rental Projections
  rent_after_reno_low: number | null;
  rent_after_reno_high: number | null;
  rent_after_reno_basement_low: number | null;
  rent_after_reno_basement_high: number | null;
  // Deal Narrative
  renovation_overview: string | null;
  why_deal_is_strong: string | null;
  // Contact
  showing_instructions: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  // Moderation
  is_featured: boolean;
  moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderation_note: string | null;
  moderated_at: string | null;
  moderated_by: string | null;
  // Timestamps
  created_at: string;
  updated_at: string;
  photos?: PropertyPhoto[];
  comps?: Comp[];
}

export interface PropertyPhoto {
  id: string;
  property_id: string;
  url: string;
  storage_path: string;
  display_order: number;
  created_at: string;
}

export interface Comp {
  id: string;
  property_id: string;
  address: string;
  sale_price: number | null;
  sqft: number | null;
  beds: number | null;
  baths: number | null;
  date_sold: string | null;
  distance: string | null;
  created_at: string;
}

export interface DealAnalysis {
  mao: number;
  potentialProfit: number;
  roi: number;
  profitLightRehabLow: number;
  profitLightRehabHigh: number;
  profitFullRehabLow: number;
  profitFullRehabHigh: number;
}

export type PropertyFormData = Omit<Property, 'id' | 'user_id' | 'slug' | 'created_at' | 'updated_at' | 'photos' | 'comps' | 'is_featured' | 'moderation_status' | 'moderation_note' | 'moderated_at' | 'moderated_by'>;

export interface SavedListing {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export type MessageType = 'request_showing' | 'make_offer' | 'ask_question';

export interface ListingMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  property_id: string;
  message_type: MessageType;
  message: string;
  is_read: boolean;
  created_at: string;
}
