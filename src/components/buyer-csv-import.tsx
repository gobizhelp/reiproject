"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CSVFieldMapper from "./csv-field-mapper";
import { BUYER_IMPORT_FIELDS, convertValue } from "@/lib/csv-utils";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

// Array-type columns in buy_box_submissions
const ARRAY_COLUMNS = new Set(["property_types", "financing_types", "property_conditions"]);

export default function BuyerCSVImport() {
  const router = useRouter();
  const [formId, setFormId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [noForm, setNoForm] = useState(false);

  useEffect(() => {
    async function loadForm() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: forms } = await supabase
        .from("buy_box_forms")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (forms && forms.length > 0) {
        setFormId(forms[0].id);
      } else {
        setNoForm(true);
      }
      setLoading(false);
    }
    loadForm();
  }, []);

  const handleImport = async (
    mappedRows: Record<string, any>[]
  ): Promise<{ success: number; errors: string[] }> => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !formId) {
      return { success: 0, errors: ["Not authenticated or no buy box form found."] };
    }

    let success = 0;
    const errors: string[] = [];

    for (let i = 0; i < mappedRows.length; i++) {
      const row = mappedRows[i];
      const rowNum = i + 2;

      // Validate required fields
      const firstName = row.first_name?.toString().trim();
      const lastName = row.last_name?.toString().trim();
      const email = row.email?.toString().trim();

      if (!firstName || !lastName || !email) {
        errors.push(`Row ${rowNum}: Missing required fields (first name, last name, email).`);
        continue;
      }

      // Build submission data
      const submissionData: Record<string, any> = {
        form_id: formId,
        first_name: firstName,
        last_name: lastName,
        email,
      };

      for (const field of BUYER_IMPORT_FIELDS) {
        if (field.key in row && row[field.key] !== undefined && row[field.key] !== "") {
          // Skip already-handled required fields
          if (["first_name", "last_name", "email"].includes(field.key)) continue;

          if (ARRAY_COLUMNS.has(field.key)) {
            // Parse comma-separated values into an array
            const val = String(row[field.key]);
            submissionData[field.key] = val
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
          } else {
            const converted = convertValue(String(row[field.key]), field);
            if (converted !== null) {
              submissionData[field.key] = converted;
            }
          }
        }
      }

      const { error } = await supabase.from("buy_box_submissions").insert(submissionData);

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

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-16 text-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (noForm) {
    return (
      <div className="bg-card border border-border rounded-2xl p-16 text-center">
        <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">No Buy Box Form Found</p>
        <p className="text-muted text-sm mb-6">
          You need to create a buy box form before importing buyers.
          Imported buyers will be added as submissions to your form.
        </p>
        <Link
          href="/buyers/form"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold transition-colors"
        >
          Create Buy Box Form
        </Link>
      </div>
    );
  }

  return (
    <CSVFieldMapper
      importFields={BUYER_IMPORT_FIELDS}
      onImport={handleImport}
      entityName="buyers"
    />
  );
}
