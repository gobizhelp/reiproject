export type BuyBoxFieldType = 'text' | 'number' | 'email' | 'tel' | 'textarea' | 'select' | 'multi-select' | 'checkbox';

export const FIELD_TYPE_LABELS: Record<BuyBoxFieldType, string> = {
  text: 'Short Text',
  number: 'Number',
  email: 'Email',
  tel: 'Phone',
  textarea: 'Long Text',
  select: 'Dropdown',
  'multi-select': 'Multi Select',
  checkbox: 'Checkbox',
};

export interface BuyBoxField {
  id: string;
  label: string;
  enabled: boolean;
  required: boolean;
  section: string;
  type: BuyBoxFieldType;
  options?: string[];
  placeholder?: string;
  isCustom?: boolean;
}

export interface BuyBoxForm {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string;
  fields: BuyBoxField[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BuyBoxSubmission {
  id: string;
  form_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
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
  deals_completed: number | null;
  years_experience: number | null;
  additional_notes: string | null;
  custom_fields: Record<string, any> | null;
  created_at: string;
}

// Known DB column field IDs - these map to real columns in buy_box_submissions
export const DB_COLUMN_FIELD_IDS = new Set([
  'first_name', 'last_name', 'email', 'phone', 'company_name',
  'property_types', 'locations', 'min_price', 'max_price',
  'min_beds', 'min_baths', 'min_sqft', 'max_sqft',
  'financing_types', 'proof_of_funds', 'closing_timeline',
  'property_conditions', 'deals_completed', 'years_experience',
  'additional_notes',
]);

export const PROPERTY_TYPE_OPTIONS = [
  'Single Family',
  'Multi Family',
  'Townhouse',
  'Condo',
  'Duplex',
  'Triplex',
  'Fourplex',
  'Mobile Home',
  'Land',
  'Commercial',
];

export const FINANCING_TYPE_OPTIONS = [
  'Cash',
  'Hard Money',
  'Conventional',
  'FHA',
  'VA',
  'Seller Financing',
  'Private Money',
  'DSCR',
];

export const PROPERTY_CONDITION_OPTIONS = [
  'Turnkey',
  'Light Rehab',
  'Medium Rehab',
  'Heavy Rehab',
  'Teardown / New Build',
];

export const CLOSING_TIMELINE_OPTIONS = [
  '7 days',
  '14 days',
  '21 days',
  '30 days',
  '45 days',
  '60 days',
  '90+ days',
];

export const DEFAULT_BUY_BOX_FIELDS: BuyBoxField[] = [
  // Contact
  { id: 'first_name', label: 'First Name', enabled: true, required: true, section: 'Contact Information', type: 'text', placeholder: 'John' },
  { id: 'last_name', label: 'Last Name', enabled: true, required: true, section: 'Contact Information', type: 'text', placeholder: 'Doe' },
  { id: 'email', label: 'Email', enabled: true, required: true, section: 'Contact Information', type: 'email', placeholder: 'john@example.com' },
  { id: 'phone', label: 'Phone', enabled: true, required: false, section: 'Contact Information', type: 'tel', placeholder: '(555) 123-4567' },
  { id: 'company_name', label: 'Company Name', enabled: true, required: false, section: 'Contact Information', type: 'text', placeholder: 'Acme Investments LLC' },

  // Investment Criteria
  { id: 'property_types', label: 'Property Types', enabled: true, required: false, section: 'Investment Criteria', type: 'multi-select', options: PROPERTY_TYPE_OPTIONS },
  { id: 'locations', label: 'Target Markets / Areas', enabled: true, required: false, section: 'Investment Criteria', type: 'textarea', placeholder: 'Miami-Dade County, Broward County, Palm Beach...' },
  { id: 'min_price', label: 'Min Purchase Price', enabled: true, required: false, section: 'Investment Criteria', type: 'number', placeholder: '50000' },
  { id: 'max_price', label: 'Max Purchase Price', enabled: true, required: false, section: 'Investment Criteria', type: 'number', placeholder: '500000' },
  { id: 'min_beds', label: 'Min Beds', enabled: true, required: false, section: 'Investment Criteria', type: 'number', placeholder: '2' },
  { id: 'min_baths', label: 'Min Baths', enabled: true, required: false, section: 'Investment Criteria', type: 'number', placeholder: '1' },
  { id: 'min_sqft', label: 'Min Sqft', enabled: true, required: false, section: 'Investment Criteria', type: 'number', placeholder: '800' },
  { id: 'max_sqft', label: 'Max Sqft', enabled: false, required: false, section: 'Investment Criteria', type: 'number', placeholder: '5000' },

  // Financing
  { id: 'financing_types', label: 'Financing Method', enabled: true, required: false, section: 'Financing', type: 'multi-select', options: FINANCING_TYPE_OPTIONS },
  { id: 'proof_of_funds', label: 'Proof of Funds Available', enabled: true, required: false, section: 'Financing', type: 'checkbox' },
  { id: 'closing_timeline', label: 'Closing Timeline', enabled: true, required: false, section: 'Financing', type: 'select', options: CLOSING_TIMELINE_OPTIONS },

  // Property Conditions
  { id: 'property_conditions', label: 'Acceptable Property Conditions', enabled: true, required: false, section: 'Property Conditions', type: 'multi-select', options: PROPERTY_CONDITION_OPTIONS },

  // Experience
  { id: 'deals_completed', label: 'Deals Completed', enabled: true, required: false, section: 'Experience', type: 'number', placeholder: '0' },
  { id: 'years_experience', label: 'Years of Experience', enabled: false, required: false, section: 'Experience', type: 'number', placeholder: '0' },

  // Notes
  { id: 'additional_notes', label: 'Additional Notes', enabled: true, required: false, section: 'Additional', type: 'textarea', placeholder: 'Any other criteria or preferences...' },
];
