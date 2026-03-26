"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BuyBoxForm,
  BuyBoxField,
  PROPERTY_TYPE_OPTIONS,
  FINANCING_TYPE_OPTIONS,
  PROPERTY_CONDITION_OPTIONS,
  CLOSING_TIMELINE_OPTIONS,
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

  function getOptions(field: BuyBoxField): string[] {
    if (field.options) return field.options;
    switch (field.id) {
      case "property_types": return PROPERTY_TYPE_OPTIONS;
      case "financing_types": return FINANCING_TYPE_OPTIONS;
      case "property_conditions": return PROPERTY_CONDITION_OPTIONS;
      case "closing_timeline": return CLOSING_TIMELINE_OPTIONS;
      default: return [];
    }
  }

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
      }
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const submission: Record<string, any> = {
        form_id: form.id,
        first_name: formData.first_name || "",
        last_name: formData.last_name || "",
        email: formData.email || "",
        phone: formData.phone || null,
        company_name: formData.company_name || null,
        property_types: formData.property_types || [],
        locations: formData.locations || null,
        min_price: formData.min_price ? parseFloat(formData.min_price) : null,
        max_price: formData.max_price ? parseFloat(formData.max_price) : null,
        min_beds: formData.min_beds ? parseInt(formData.min_beds) : null,
        min_baths: formData.min_baths ? parseInt(formData.min_baths) : null,
        min_sqft: formData.min_sqft ? parseInt(formData.min_sqft) : null,
        max_sqft: formData.max_sqft ? parseInt(formData.max_sqft) : null,
        financing_types: formData.financing_types || [],
        proof_of_funds: formData.proof_of_funds || false,
        closing_timeline: formData.closing_timeline || null,
        property_conditions: formData.property_conditions || [],
        deals_completed: formData.deals_completed ? parseInt(formData.deals_completed) : null,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        additional_notes: formData.additional_notes || null,
      };

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

  // Group enabled fields by section
  const sections = enabledFields.reduce<Record<string, BuyBoxField[]>>((acc, field) => {
    if (!acc[field.section]) acc[field.section] = [];
    acc[field.section].push(field);
    return acc;
  }, {});

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
          {Object.entries(sections).map(([sectionName, sectionFields]) => (
            <section
              key={sectionName}
              className="bg-card border border-border rounded-2xl p-6 md:p-8"
            >
              <h2 className="text-lg font-semibold mb-5">{sectionName}</h2>
              <div className="space-y-4">
                {sectionFields.map((field) => (
                  <div key={field.id}>
                    {field.type === "checkbox" ? (
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData[field.id] || false}
                          onChange={(e) => updateField(field.id, e.target.checked)}
                          className="w-4 h-4 rounded border-border text-accent focus:ring-accent bg-background"
                        />
                        <span className="text-sm">
                          {field.label}
                          {field.required && <span className="text-danger ml-1">*</span>}
                        </span>
                      </label>
                    ) : field.type === "multi-select" ? (
                      <div>
                        <label className={labelClass}>
                          {field.label}
                          {field.required && <span className="text-danger ml-1">*</span>}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {getOptions(field).map((option) => {
                            const selected = (formData[field.id] || []).includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => toggleMultiSelect(field.id, option)}
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
                    ) : field.type === "select" ? (
                      <div>
                        <label className={labelClass}>
                          {field.label}
                          {field.required && <span className="text-danger ml-1">*</span>}
                        </label>
                        <select
                          value={formData[field.id] || ""}
                          onChange={(e) => updateField(field.id, e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select...</option>
                          {getOptions(field).map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : field.type === "textarea" ? (
                      <div>
                        <label className={labelClass}>
                          {field.label}
                          {field.required && <span className="text-danger ml-1">*</span>}
                        </label>
                        <textarea
                          value={formData[field.id] || ""}
                          onChange={(e) => updateField(field.id, e.target.value)}
                          className={`${inputClass} min-h-[80px]`}
                          placeholder={field.placeholder}
                        />
                      </div>
                    ) : field.type === "number" ? (
                      <div>
                        <label className={labelClass}>
                          {field.label}
                          {field.required && <span className="text-danger ml-1">*</span>}
                        </label>
                        {field.id.includes("price") ? (
                          <div className="relative">
                            <span className="absolute left-4 top-3 text-muted">$</span>
                            <input
                              type="number"
                              value={formData[field.id] || ""}
                              onChange={(e) => updateField(field.id, e.target.value)}
                              className={`${inputClass} pl-8`}
                              placeholder={field.placeholder}
                              min="0"
                            />
                          </div>
                        ) : (
                          <input
                            type="number"
                            value={formData[field.id] || ""}
                            onChange={(e) => updateField(field.id, e.target.value)}
                            className={inputClass}
                            placeholder={field.placeholder}
                            min="0"
                          />
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className={labelClass}>
                          {field.label}
                          {field.required && <span className="text-danger ml-1">*</span>}
                        </label>
                        <input
                          type={field.type}
                          value={formData[field.id] || ""}
                          onChange={(e) => updateField(field.id, e.target.value)}
                          className={inputClass}
                          placeholder={field.placeholder}
                        />
                      </div>
                    )}
                  </div>
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
