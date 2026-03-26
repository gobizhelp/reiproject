"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CSVFieldMapper from "./csv-field-mapper";
import { PROPERTY_IMPORT_FIELDS, convertValue } from "@/lib/csv-utils";

export default function PropertyCSVImport() {
  const router = useRouter();

  const handleImport = async (
    mappedRows: Record<string, any>[]
  ): Promise<{ success: number; errors: string[] }> => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: 0, errors: ["Not authenticated. Please log in and try again."] };
    }

    let success = 0;
    const errors: string[] = [];

    for (let i = 0; i < mappedRows.length; i++) {
      const row = mappedRows[i];
      const rowNum = i + 2; // +2 because row 1 is headers, data starts at 2

      // Validate required fields
      const streetAddress = row.street_address?.toString().trim();
      const city = row.city?.toString().trim();
      const state = row.state?.toString().trim();
      const zipCode = row.zip_code?.toString().trim();

      if (!streetAddress || !city || !state || !zipCode) {
        errors.push(`Row ${rowNum}: Missing required address fields (street, city, state, zip).`);
        continue;
      }

      // Build property data with type conversion
      const propertyData: Record<string, any> = {
        user_id: user.id,
        status: "draft",
        street_address: streetAddress,
        city,
        state,
        zip_code: zipCode,
        property_type: row.property_type?.toString().trim() || "Single Family",
        show_assignment_fee: false,
      };

      // Map all other fields with type conversion
      for (const field of PROPERTY_IMPORT_FIELDS) {
        if (field.key in row && row[field.key] !== undefined && row[field.key] !== "") {
          // Skip required address fields already handled above
          if (["street_address", "city", "state", "zip_code"].includes(field.key)) continue;

          const converted = convertValue(String(row[field.key]), field);
          if (converted !== null) {
            propertyData[field.key] = converted;
          }
        }
      }

      // Generate a unique slug
      const slugBase = `${streetAddress}-${city}-${state}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      propertyData.slug = `${slugBase}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const { error } = await supabase.from("properties").insert(propertyData);

      if (error) {
        errors.push(`Row ${rowNum}: ${error.message}`);
      } else {
        success++;
      }
    }

    if (success > 0) {
      router.refresh();
    }

    return { success, errors };
  };

  return (
    <CSVFieldMapper
      importFields={PROPERTY_IMPORT_FIELDS}
      onImport={handleImport}
      entityName="properties"
    />
  );
}
