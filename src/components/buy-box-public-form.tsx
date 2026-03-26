"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BuyBoxForm,
  BuyBoxField,
  DB_COLUMN_FIELD_IDS,
} from "@/lib/buy-box-types";
import { Loader2, Send, CheckCircle } from "lucide-react";

interface Props {
  form: BuyBoxForm;
}

export default function BuyBoxPublicForm({ form }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const enabledFields = form.fields.filter((f) => f.enabled);

  function updateField(id: string, value: any) {
    setFormData((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMultiSelect(id: string, option: string) {
    setFormData((prev) => {
      const current: string[] = prev[id] || [];
      return {
        ...prev,
        [id]: current.includes(option)
          ? current.filter((o: string) => o !== option)
          : [...current, option],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validate required fields
    for (const field of enabledFields) {
      if (field.required) {
        const val = formData[field.id];
        if (!val || (typeof val === "string" && !val.trim())) {
          setError(`${field.label} is required.`);
          return;
        }
        if (Array.isArray(val) && val.length === 0) {
          setError(`${field.label} is required.`);
          return;
        }
      }
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Separate known DB columns from custom fields
      const customFields: Record<string, any> = {};
      const submission: Record<string, any> = {
        form_id: form.id,
        first_name: formData.first_name || "",
        last_name: formData.last_name || "",
        email: formData.email || "",
      };

      for (const field of enabledFields) {
        const val = formData[field.id];
        if (DB_COLUMN_FIELD_IDS.has(field.id)) {
          // Map to the correct DB column type
          if (field.type === "number") {
            submission[field.id] = val ? parseFloat(val) : null;
          } else if (field.type === "checkbox") {
            submission[field.id] = val || false;
          } else if (field.type === "multi-select") {
            submission[field.id] = val || [];
          } else {
            submission[field.id] = val || null;
          }
        } else {
          // Custom field - store in custom_fields JSONB
          if (val !== undefined && val !== "" && val !== null) {
            customFields[field.id] = {
              label: field.label,
              value: val,
              type: field.type,
            };
          }
        }
      }

      // Fill defaults for DB columns not in the form
      if (!submission.phone) submission.phone = null;
      if (!submission.company_name) submission.company_name = null;
      if (!submission.property_types) submission.property_types = [];
      if (!submission.locations) submission.locations = null;
      if (!submission.min_price) submission.min_price = null;
      if (!submission.max_price) submission.max_price = null;
      if (!submission.min_beds) submission.min_beds = null;
      if (!submission.min_baths) submission.min_baths = null;
      if (!submission.min_sqft) submission.min_sqft = null;
      if (!submission.max_sqft) submission.max_sqft = null;
      if (!submission.financing_types) submission.financing_types = [];
      if (submission.proof_of_funds === undefined) submission.proof_of_funds = false;
      if (!submission.closing_timeline) submission.closing_timeline = null;
      if (!submission.property_conditions) submission.property_conditions = [];
      if (!submission.deals_completed) submission.deals_completed = null;
      if (!submission.years_experience) submission.years_experience = null;
      if (!submission.additional_notes) submission.additional_notes = null;

      if (Object.keys(customFields).length > 0) {
        submission.custom_fields = customFields;
      }

      const { error: insertError } = await supabase
        .from("buy_box_submissions")
        .insert(submission);

      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";
  const labelClass = "block text-sm font-medium mb-2";

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-12 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted">
            Your buy box criteria has been submitted. We&apos;ll match you with deals that fit your criteria.
          </p>
        </div>
      </div>
    );
  }

  // Group enabled fields by section, preserving order
  const sections: { name: string; fields: BuyBoxField[] }[] = [];
  enabledFields.forEach((field) => {
    const existing = sections.find((s) => s.name === field.section);
    if (existing) {
      existing.fields.push(field);
    } else {
      sections.push({ name: field.section, fields: [field] });
    }
  });

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">{form.title}</h1>
          {form.description && (
            <p className="text-muted text-lg">{form.description}</p>
          )}
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {sections.map(({ name, fields: sectionFields }) => (
            <section
              key={name}
              className="bg-card border border-border rounded-2xl p-6 md:p-8"
            >
              <h2 className="text-lg font-semibold mb-5">{name}</h2>
              <div className="space-y-4">
                {sectionFields.map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={formData[field.id]}
                    onChange={(val) => updateField(field.id, val)}
                    onToggleMulti={(opt) => toggleMultiSelect(field.id, opt)}
                    inputClass={inputClass}
                    labelClass={labelClass}
                  />
                ))}
              </div>
            </section>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Submit Buy Box
          </button>
        </form>
      </div>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
  onToggleMulti,
  inputClass,
  labelClass,
}: {
  field: BuyBoxField;
  value: any;
  onChange: (val: any) => void;
  onToggleMulti: (opt: string) => void;
  inputClass: string;
  labelClass: string;
}) {
  const options = field.options || [];

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-border text-accent focus:ring-accent bg-background"
        />
        <span className="text-sm">
          {field.label}
          {field.required && <span className="text-danger ml-1">*</span>}
        </span>
      </label>
    );
  }

  if (field.type === "multi-select") {
    return (
      <div>
        <label className={labelClass}>
          {field.label}
          {field.required && <span className="text-danger ml-1">*</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const selected = (value || []).includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => onToggleMulti(option)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  selected
                    ? "bg-accent text-white border-accent"
                    : "bg-background border-border text-foreground hover:border-accent/50"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <label className={labelClass}>
          {field.label}
          {field.required && <span className="text-danger ml-1">*</span>}
        </label>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        >
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <label className={labelClass}>
          {field.label}
          {field.required && <span className="text-danger ml-1">*</span>}
        </label>
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} min-h-[80px]`}
          placeholder={field.placeholder}
        />
      </div>
    );
  }

  if (field.type === "number") {
    const showDollar = field.id.includes("price") || field.label.toLowerCase().includes("price") || field.label.toLowerCase().includes("budget");
    return (
      <div>
        <label className={labelClass}>
          {field.label}
          {field.required && <span className="text-danger ml-1">*</span>}
        </label>
        {showDollar ? (
          <div className="relative">
            <span className="absolute left-4 top-3 text-muted">$</span>
            <input
              type="number"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className={`${inputClass} pl-8`}
              placeholder={field.placeholder}
              min="0"
            />
          </div>
        ) : (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            placeholder={field.placeholder}
            min="0"
          />
        )}
      </div>
    );
  }

  // text, email, tel
  return (
    <div>
      <label className={labelClass}>
        {field.label}
        {field.required && <span className="text-danger ml-1">*</span>}
      </label>
      <input
        type={field.type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder={field.placeholder}
      />
    </div>
  );
}
