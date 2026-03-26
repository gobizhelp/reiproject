export interface Property {
  id: string;
  user_id: string;
  slug: string;
  status: 'draft' | 'published';
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  year_built: number | null;
  lot_size: string | null;
  asking_price: number | null;
  arv: number | null;
  repair_estimate: number | null;
  assignment_fee: number | null;
  show_assignment_fee: boolean;
  showing_instructions: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
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
}

export type PropertyFormData = Omit<Property, 'id' | 'user_id' | 'slug' | 'created_at' | 'updated_at' | 'photos' | 'comps'>;
