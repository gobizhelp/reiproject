"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BuyBoxForm, BuyBoxField, DEFAULT_BUY_BOX_FIELDS } from "@/lib/buy-box-types";
import { Loader2, Save, GripVertical, Eye, EyeOff, Asterisk, Link, Copy, Check } from "lucide-react";

interface Props {
  form?: BuyBoxForm;
}

export default function BuyBoxFormEditor({ form }: Props) {
  const router = useRouter();
  const isEditing = !!form;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [title, setTitle] = useState(form?.title || "My Buyer Criteria Form");
  const [description, setDescription] = useState(
    form?.description || "Fill out this form so I can match you with the right deals."
  );
  const [isActive, setIsActive] = useState(form?.is_active ?? true);
  const [fields, setFields] = useState<BuyBoxField[]>(
    form?.fields?.length ? form.fields : DEFAULT_BUY_BOX_FIELDS
  );

  function toggleField(id: string) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  }

  function toggleRequired(id: string) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
  }

  function updateLabel(id: string, label: string) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, label } : f))
    );
  }

  function generateSlug(): string {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) +
      "-" +
      Math.random().toString(36).slice(2, 8)
    );
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Please enter a form title.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    try {
      const formData = {
        title: title.trim(),
        description: description.trim(),
        fields: fields as any,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { error } = await supabase
          .from("buy_box_forms")
          .update(formData)
          .eq("id", form.id);
        if (error) throw error;
      } else {
        const slug = generateSlug();
        const { error } = await supabase
          .from("buy_box_forms")
          .insert({ ...formData, slug, user_id: user.id });
        if (error) throw error;
      }

      router.push("/buyers");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!form?.slug) return;
    const url = `${window.location.origin}/buy-box/${form.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputClass =
    "w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";
  const labelClass = "block text-sm font-medium mb-2";

  // Group fields by section
  const sections = fields.reduce<Record<string, BuyBoxField[]>>((acc, field) => {
    if (!acc[field.section]) acc[field.section] = [];
    acc[field.section].push(field);
    return acc;
  }, {});

  return (
    <div className="space-y-8 pb-12">
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Form Settings */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Form Settings</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Form Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="My Buyer Criteria Form"
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} min-h-[80px]`}
              placeholder="Instructions shown to buyers at the top of the form..."
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent bg-background"
              />
              <span className="text-sm">Form is active and accepting submissions</span>
            </label>
            {isEditing && form?.slug && (
              <button
                onClick={copyLink}
                className="flex items-center gap-2 text-accent hover:text-accent-hover text-sm transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Form Link
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Field Configuration */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Form Fields</h2>
          <p className="text-muted text-sm">Toggle fields on/off, mark required, edit labels</p>
        </div>

        <div className="space-y-8">
          {Object.entries(sections).map(([sectionName, sectionFields]) => (
            <div key={sectionName}>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                {sectionName}
              </h3>
              <div className="space-y-2">
                {sectionFields.map((field) => (
                  <div
                    key={field.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      field.enabled
                        ? "border-border bg-background"
                        : "border-border/50 bg-card opacity-50"
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-muted flex-shrink-0" />

                    {/* Toggle visibility */}
                    <button
                      onClick={() => toggleField(field.id)}
                      className={`flex-shrink-0 p-1 rounded transition-colors ${
                        field.enabled
                          ? "text-success hover:text-success/80"
                          : "text-muted hover:text-foreground"
                      }`}
                      title={field.enabled ? "Hide field" : "Show field"}
                    >
                      {field.enabled ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    {/* Label (editable) */}
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateLabel(field.id, e.target.value)}
                      className="flex-1 bg-transparent border-none text-sm text-foreground focus:outline-none focus:ring-0 px-0"
                      disabled={!field.enabled}
                    />

                    {/* Field type badge */}
                    <span className="text-xs text-muted bg-card px-2 py-1 rounded flex-shrink-0">
                      {field.type}
                    </span>

                    {/* Toggle required */}
                    <button
                      onClick={() => toggleRequired(field.id)}
                      disabled={!field.enabled}
                      className={`flex-shrink-0 p-1 rounded text-xs font-semibold transition-colors ${
                        field.required
                          ? "text-danger hover:text-danger/80"
                          : "text-muted hover:text-foreground"
                      }`}
                      title={field.required ? "Make optional" : "Make required"}
                    >
                      <Asterisk className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditing ? "Save Changes" : "Create Form"}
        </button>
        {isEditing && form?.slug && (
          <a
            href={`/buy-box/${form.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-border hover:bg-border/80 text-foreground px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Link className="w-4 h-4" />
            Preview Form
          </a>
        )}
      </div>
    </div>
  );
}
