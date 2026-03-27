export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
}

export function parseCSV(text: string): ParsedCSV {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) {
    return { headers: [], rows: [], rowCount: 0 };
  }

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? "";
    });
    rows.push(row);
  }

  return { headers, rows, rowCount: rows.length };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

export interface ImportField {
  key: string;
  label: string;
  section: string;
  type: "string" | "number" | "boolean";
  required?: boolean;
}

// Property fields available for CSV import mapping
export const PROPERTY_IMPORT_FIELDS: ImportField[] = [
  // Address (required)
  { key: "street_address", label: "Street Address", section: "Address", type: "string", required: true },
  { key: "city", label: "City", section: "Address", type: "string", required: true },
  { key: "state", label: "State", section: "Address", type: "string", required: true },
  { key: "zip_code", label: "Zip Code", section: "Address", type: "string", required: true },
  // Property Info
  { key: "title", label: "Title", section: "Property Info", type: "string" },
  { key: "listing_status", label: "Listing Status", section: "Property Info", type: "string" },
  { key: "ideal_investor_strategy", label: "Ideal Investor Strategy", section: "Property Info", type: "string" },
  { key: "property_type", label: "Property Type", section: "Property Info", type: "string" },
  { key: "beds", label: "Beds", section: "Property Info", type: "number" },
  { key: "baths", label: "Baths", section: "Property Info", type: "number" },
  { key: "sqft", label: "Sqft", section: "Property Info", type: "number" },
  { key: "year_built", label: "Year Built", section: "Property Info", type: "number" },
  { key: "lot_size", label: "Lot Size", section: "Property Info", type: "string" },
  { key: "basement_description", label: "Basement Description", section: "Property Info", type: "string" },
  { key: "neighborhood_notes", label: "Neighborhood Notes", section: "Property Info", type: "string" },
  { key: "condition_summary", label: "Condition Summary", section: "Property Info", type: "string" },
  { key: "comps_summary", label: "Comps Summary", section: "Property Info", type: "string" },
  // Financials
  { key: "asking_price", label: "Asking Price", section: "Financials", type: "number" },
  { key: "arv", label: "ARV", section: "Financials", type: "number" },
  { key: "repair_estimate", label: "Repair Estimate", section: "Financials", type: "number" },
  { key: "assignment_fee", label: "Assignment Fee", section: "Financials", type: "number" },
  { key: "light_rehab_budget_low", label: "Light Rehab Budget (Low)", section: "Financials", type: "number" },
  { key: "light_rehab_budget_high", label: "Light Rehab Budget (High)", section: "Financials", type: "number" },
  { key: "full_rehab_budget_low", label: "Full Rehab Budget (Low)", section: "Financials", type: "number" },
  { key: "full_rehab_budget_high", label: "Full Rehab Budget (High)", section: "Financials", type: "number" },
  { key: "light_rehab_arv", label: "Light Rehab ARV", section: "Financials", type: "number" },
  { key: "full_rehab_arv_low", label: "Full Rehab ARV (Low)", section: "Financials", type: "number" },
  { key: "full_rehab_arv_high", label: "Full Rehab ARV (High)", section: "Financials", type: "number" },
  // Rental Projections
  { key: "rent_after_reno_low", label: "Rent After Reno (Low)", section: "Rental Projections", type: "number" },
  { key: "rent_after_reno_high", label: "Rent After Reno (High)", section: "Rental Projections", type: "number" },
  { key: "rent_after_reno_basement_low", label: "Rent w/ Basement (Low)", section: "Rental Projections", type: "number" },
  { key: "rent_after_reno_basement_high", label: "Rent w/ Basement (High)", section: "Rental Projections", type: "number" },
  // Deal Narrative
  { key: "renovation_overview", label: "Renovation Overview", section: "Deal Narrative", type: "string" },
  { key: "why_deal_is_strong", label: "Why Deal is Strong", section: "Deal Narrative", type: "string" },
  // Contact
  { key: "showing_instructions", label: "Showing Instructions", section: "Contact", type: "string" },
  { key: "contact_name", label: "Contact Name", section: "Contact", type: "string" },
  { key: "contact_phone", label: "Contact Phone", section: "Contact", type: "string" },
  { key: "contact_email", label: "Contact Email", section: "Contact", type: "string" },
];

// Buyer/Buy Box submission fields available for CSV import mapping
export const BUYER_IMPORT_FIELDS: ImportField[] = [
  // Contact (required)
  { key: "first_name", label: "First Name", section: "Contact", type: "string", required: true },
  { key: "last_name", label: "Last Name", section: "Contact", type: "string", required: true },
  { key: "email", label: "Email", section: "Contact", type: "string", required: true },
  { key: "phone", label: "Phone", section: "Contact", type: "string" },
  { key: "company_name", label: "Company Name", section: "Contact", type: "string" },
  // Investment Criteria
  { key: "property_types", label: "Property Types (comma-separated)", section: "Investment Criteria", type: "string" },
  { key: "locations", label: "Target Markets / Areas", section: "Investment Criteria", type: "string" },
  { key: "min_price", label: "Min Purchase Price", section: "Investment Criteria", type: "number" },
  { key: "max_price", label: "Max Purchase Price", section: "Investment Criteria", type: "number" },
  { key: "min_beds", label: "Min Beds", section: "Investment Criteria", type: "number" },
  { key: "min_baths", label: "Min Baths", section: "Investment Criteria", type: "number" },
  { key: "min_sqft", label: "Min Sqft", section: "Investment Criteria", type: "number" },
  { key: "max_sqft", label: "Max Sqft", section: "Investment Criteria", type: "number" },
  // Financing
  { key: "financing_types", label: "Financing Types (comma-separated)", section: "Financing", type: "string" },
  { key: "closing_timeline", label: "Closing Timeline", section: "Financing", type: "string" },
  // Property Conditions
  { key: "property_conditions", label: "Property Conditions (comma-separated)", section: "Property Conditions", type: "string" },
  // Experience
  { key: "deals_completed", label: "Deals Completed", section: "Experience", type: "number" },
  { key: "years_experience", label: "Years of Experience", section: "Experience", type: "number" },
  // Notes
  { key: "additional_notes", label: "Additional Notes", section: "Additional", type: "string" },
];

// Auto-match CSV headers to import fields by fuzzy matching
export function autoMatchFields(
  csvHeaders: string[],
  importFields: ImportField[]
): Record<string, string> {
  const mapping: Record<string, string> = {};

  for (const header of csvHeaders) {
    const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Try exact key match first
    const exactMatch = importFields.find(
      (f) => f.key.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized
    );
    if (exactMatch) {
      mapping[header] = exactMatch.key;
      continue;
    }

    // Try label match
    const labelMatch = importFields.find(
      (f) => f.label.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized
    );
    if (labelMatch) {
      mapping[header] = labelMatch.key;
      continue;
    }

    // Try partial / common alias matches
    const aliases: Record<string, string[]> = {
      street_address: ["address", "streetaddress", "street", "address1", "propertyaddress"],
      city: ["city", "town"],
      state: ["state", "st"],
      zip_code: ["zip", "zipcode", "postalcode", "postal"],
      property_type: ["propertytype", "type", "proptype"],
      beds: ["beds", "bedrooms", "br", "bed"],
      baths: ["baths", "bathrooms", "ba", "bath"],
      sqft: ["sqft", "squarefeet", "sqfeet", "sf", "squarefootage", "livingarea"],
      year_built: ["yearbuilt", "built", "year"],
      asking_price: ["askingprice", "price", "listprice", "listingprice", "amount"],
      arv: ["arv", "afterrepairvalue"],
      repair_estimate: ["repairestimate", "repairs", "rehabcost", "repaircost"],
      assignment_fee: ["assignmentfee", "fee", "wholesalefee"],
      first_name: ["firstname", "first", "fname"],
      last_name: ["lastname", "last", "lname"],
      email: ["email", "emailaddress", "mail"],
      phone: ["phone", "phonenumber", "tel", "telephone", "cell", "mobile"],
      company_name: ["companyname", "company", "businessname", "business"],
      min_price: ["minprice", "minpurchaseprice", "minimumprice"],
      max_price: ["maxprice", "maxpurchaseprice", "maximumprice", "budget"],
      property_types: ["propertytypes", "types", "proptypes"],
      locations: ["locations", "targetmarkets", "markets", "areas", "location", "market", "area"],
      financing_types: ["financingtypes", "financing", "financingmethod"],
      closing_timeline: ["closingtimeline", "closing", "timeline"],
      deals_completed: ["dealscompleted", "deals", "closeddeals"],
      years_experience: ["yearsexperience", "experience", "yearsofexperience"],
      lot_size: ["lotsize", "lot", "lotacres", "acres", "lotsqft"],
      contact_name: ["contactname", "contact", "agentname", "agent"],
      contact_phone: ["contactphone", "agentphone"],
      contact_email: ["contactemail", "agentemail"],
    };

    for (const [fieldKey, aliasList] of Object.entries(aliases)) {
      if (importFields.some((f) => f.key === fieldKey) && aliasList.includes(normalized)) {
        mapping[header] = fieldKey;
        break;
      }
    }
  }

  return mapping;
}

// Convert a raw string value to the appropriate type for a field
export function convertValue(
  value: string,
  field: ImportField
): string | number | boolean | string[] | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;

  switch (field.type) {
    case "number": {
      const cleaned = trimmed.replace(/[$,\s]/g, "");
      const num = Number(cleaned);
      return isNaN(num) ? null : num;
    }
    case "boolean": {
      const lower = trimmed.toLowerCase();
      return ["true", "yes", "1", "y"].includes(lower);
    }
    default:
      return trimmed;
  }
}
