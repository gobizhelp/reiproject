export interface Property {
  id: string;
  user_id: string;
  slug: string;
  status: 'draft' | 'published';
  seller_status: 'active' | 'pending' | 'sold' | 'archived';
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
  published_at: string | null;
  // Geolocation
  latitude: number | null;
  longitude: number | null;
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

export type PropertyFormData = Omit<Property, 'id' | 'user_id' | 'slug' | 'created_at' | 'updated_at' | 'published_at' | 'photos' | 'comps' | 'is_featured' | 'moderation_status' | 'moderation_note' | 'moderated_at' | 'moderated_by' | 'seller_status'>;

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

export interface Conversation {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  buyer_shared_contact: boolean;
  initial_action: MessageType;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface BuyerNote {
  id: string;
  user_id: string;
  property_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Deal Pipeline Stages
export type DealStage = 'saved' | 'reviewing' | 'contacted' | 'passed';

export interface DealStageRecord {
  id: string;
  user_id: string;
  property_id: string;
  stage: DealStage;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Notifications
export type NotificationType =
  | 'dm_received'
  | 'showing_requested'
  | 'showing_responded'
  | 'offer_received'
  | 'offer_responded'
  | 'question_received'
  | 'question_answered'
  | 'listing_saved'
  | 'listing_approved'
  | 'listing_flagged'
  | 'price_changed'
  | 'listing_status_changed'
  | 'listing_removed'
  | 'new_listing_match';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  property_id: string | null;
  conversation_id: string | null;
  listing_message_id: string | null;
  is_read: boolean;
  read_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
