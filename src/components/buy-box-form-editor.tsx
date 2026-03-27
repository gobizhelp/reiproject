"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BuyBoxForm,
  BuyBoxField,
  BuyBoxFieldType,
  DEFAULT_BUY_BOX_FIELDS,
  FIELD_TYPE_LABELS,
} from "@/lib/buy-box-types";
import {
  Loader2,
  Save,
  Eye,
  EyeOff,
  Asterisk,
  Link,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Pencil,
  X,
  GripVertical,
  Settings2,
} from "lucide-react";

interface Props {
  form?: BuyBoxForm;
  isSystemTemplate?: boolean;
}

export default function BuyBoxFormEditor({ form, isSystemTemplate }: Props) {
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

  // Editing state
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [renamingSection, setRenamingSection] = useState<string | null>(null);
  const [renameSectionValue, setRenameSectionValue] = useState("");
  const [addingSectionName, setAddingSectionName] = useState("");
  const [showAddSection, setShowAddSection] = useState(false);

  // Get ordered unique sections
  const sectionOrder: string[] = [];
  fields.forEach((f) => {
    if (!sectionOrder.includes(f.section)) sectionOrder.push(f.section);
  });

  // --- Section operations ---

  function addSection() {
    const name = addingSectionName.trim();
    if (!name || sectionOrder.includes(name)) return;
    // Add a placeholder field so the section exists
    const newField: BuyBoxField = {
      id: `custom_${Date.now()}`,
      label: "New Field",
      enabled: true,
      required: false,
      section: name,
      type: "text",
      placeholder: "",
      isCustom: true,
    };
    setFields((prev) => [...prev, newField]);
    setAddingSectionName("");
    setShowAddSection(false);
  }

  function renameSection(oldName: string, newName: string) {
    const trimmed = newName.trim();
    if (!trimmed || (trimmed !== oldName && sectionOrder.includes(trimmed))) return;
    setFields((prev) =>
      prev.map((f) => (f.section === oldName ? { ...f, section: trimmed } : f))
    );
    setRenamingSection(null);
  }

  function deleteSection(sectionName: string) {
    setFields((prev) => prev.filter((f) => f.section !== sectionName));
  }

  function moveSectionUp(sectionName: string) {
    const idx = sectionOrder.indexOf(sectionName);
    if (idx <= 0) return;
    const prevSection = sectionOrder[idx - 1];
    // Reorder: swap all fields of these two sections in the array
    setFields((prev) => {
      const result: BuyBoxField[] = [];
      const sectionFields: Record<string, BuyBoxField[]> = {};
      prev.forEach((f) => {
        if (!sectionFields[f.section]) sectionFields[f.section] = [];
        sectionFields[f.section].push(f);
      });
      const newOrder = [...sectionOrder];
      newOrder[idx] = prevSection;
      newOrder[idx - 1] = sectionName;
      newOrder.forEach((s) => {
        if (sectionFields[s]) result.push(...sectionFields[s]);
      });
      return result;
    });
  }

  function moveSectionDown(sectionName: string) {
    const idx = sectionOrder.indexOf(sectionName);
    if (idx >= sectionOrder.length - 1) return;
    const nextSection = sectionOrder[idx + 1];
    setFields((prev) => {
      const result: BuyBoxField[] = [];
      const sectionFields: Record<string, BuyBoxField[]> = {};
      prev.forEach((f) => {
        if (!sectionFields[f.section]) sectionFields[f.section] = [];
        sectionFields[f.section].push(f);
      });
      const newOrder = [...sectionOrder];
      newOrder[idx] = nextSection;
      newOrder[idx + 1] = sectionName;
      newOrder.forEach((s) => {
        if (sectionFields[s]) result.push(...sectionFields[s]);
      });
      return result;
    });
  }

  // --- Field operations ---

  function addFieldToSection(sectionName: string) {
    const newField: BuyBoxField = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      label: "New Field",
      enabled: true,
      required: false,
      section: sectionName,
      type: "text",
      placeholder: "",
      isCustom: true,
    };
    // Insert after the last field in this section
    setFields((prev) => {
      const result: BuyBoxField[] = [];
      let inserted = false;
      let lastSectionIdx = -1;
      prev.forEach((f, i) => {
        if (f.section === sectionName) lastSectionIdx = i;
      });
      prev.forEach((f, i) => {
        result.push(f);
        if (i === lastSectionIdx && !inserted) {
          result.push(newField);
          inserted = true;
        }
      });
      if (!inserted) result.push(newField);
      return result;
    });
    setEditingFieldId(newField.id);
  }

  function deleteField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (editingFieldId === id) setEditingFieldId(null);
  }

  function updateField(id: string, updates: Partial<BuyBoxField>) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }

  function moveFieldUp(id: string) {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx <= 0) return prev;
      // Only move within same section
      if (prev[idx].section !== prev[idx - 1].section) return prev;
      const result = [...prev];
      [result[idx - 1], result[idx]] = [result[idx], result[idx - 1]];
      return result;
    });
  }

  function moveFieldDown(id: string) {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx >= prev.length - 1) return prev;
      if (prev[idx].section !== prev[idx + 1].section) return prev;
      const result = [...prev];
      [result[idx], result[idx + 1]] = [result[idx + 1], result[idx]];
      return result;
    });
  }

  // --- Options management for select/multi-select ---

  function addOption(fieldId: string) {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId
          ? { ...f, options: [...(f.options || []), "New Option"] }
          : f
      )
    );
  }

  function updateOption(fieldId: string, optIdx: number, value: string) {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId
          ? { ...f, options: (f.options || []).map((o, i) => (i === optIdx ? value : o)) }
          : f
      )
    );
  }

  function removeOption(fieldId: string, optIdx: number) {
    setFields((prev) =>
      prev.map((f) =>
        f.id === fieldId
          ? { ...f, options: (f.options || []).filter((_, i) => i !== optIdx) }
          : f
      )
    );
  }

  // --- Save ---

  const SYSTEM_TEMPLATE_SLUG = '__system_buy_box_template__';

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

      if (isSystemTemplate) {
        // Save as system-wide template
        if (isEditing) {
          const { error } = await supabase
            .from("buy_box_forms")
            .update(formData)
            .eq("slug", SYSTEM_TEMPLATE_SLUG);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("buy_box_forms")
            .insert({ ...formData, slug: SYSTEM_TEMPLATE_SLUG, user_id: user.id });
          if (error) throw error;
        }
        router.push("/admin/buy-box-form");
        router.refresh();
      } else if (isEditing) {
        const { error } = await supabase
          .from("buy_box_forms")
          .update(formData)
          .eq("id", form.id);
        if (error) throw error;
        router.push("/buyers");
        router.refresh();
      } else {
        const slug = generateSlug();
        const { error } = await supabase
          .from("buy_box_forms")
          .insert({ ...formData, slug, user_id: user.id });
        if (error) throw error;
        router.push("/buyers");
        router.refresh();
      }
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
  const smallInputClass =
    "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";

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
            {isEditing && form?.slug && !isSystemTemplate && (
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

      {/* Form Builder */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Form Builder</h2>
          <button
            onClick={() => setShowAddSection(true)}
            className="flex items-center gap-1.5 text-accent hover:text-accent-hover text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>

        {/* Add Section Input */}
        {showAddSection && (
          <div className="bg-card border border-accent/30 rounded-2xl p-4 flex items-center gap-3">
            <input
              type="text"
              value={addingSectionName}
              onChange={(e) => setAddingSectionName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSection()}
              className={smallInputClass}
              placeholder="Section name..."
              autoFocus
            />
            <button
              onClick={addSection}
              disabled={!addingSectionName.trim()}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary-hover transition-colors flex-shrink-0"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddSection(false);
                setAddingSectionName("");
              }}
              className="p-2 text-muted hover:text-foreground transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sections */}
        {sectionOrder.map((sectionName, sectionIdx) => {
          const sectionFields = fields.filter((f) => f.section === sectionName);

          return (
            <section
              key={sectionName}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              {/* Section Header */}
              <div className="flex items-center gap-2 px-4 md:px-6 py-3 bg-card border-b border-border">
                {/* Reorder section */}
                <div className="flex flex-col -my-1">
                  <button
                    onClick={() => moveSectionUp(sectionName)}
                    disabled={sectionIdx === 0}
                    className="text-muted hover:text-foreground disabled:opacity-20 transition-colors p-0.5"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveSectionDown(sectionName)}
                    disabled={sectionIdx === sectionOrder.length - 1}
                    className="text-muted hover:text-foreground disabled:opacity-20 transition-colors p-0.5"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Section name (editable) */}
                {renamingSection === sectionName ? (
                  <input
                    type="text"
                    value={renameSectionValue}
                    onChange={(e) => setRenameSectionValue(e.target.value)}
                    onBlur={() => renameSection(sectionName, renameSectionValue)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") renameSection(sectionName, renameSectionValue);
                      if (e.key === "Escape") setRenamingSection(null);
                    }}
                    className="bg-background border border-accent rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                    autoFocus
                  />
                ) : (
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted flex-1">
                    {sectionName}
                  </h3>
                )}

                {/* Section actions */}
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => {
                      setRenamingSection(sectionName);
                      setRenameSectionValue(sectionName);
                    }}
                    className="p-1.5 text-muted hover:text-foreground transition-colors rounded"
                    title="Rename section"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => addFieldToSection(sectionName)}
                    className="p-1.5 text-accent hover:text-accent-hover transition-colors rounded"
                    title="Add field to section"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete the "${sectionName}" section and all its fields?`))
                        deleteSection(sectionName);
                    }}
                    className="p-1.5 text-muted hover:text-danger transition-colors rounded"
                    title="Delete section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Fields */}
              <div className="divide-y divide-border">
                {sectionFields.map((field) => {
                  const isEditingThis = editingFieldId === field.id;
                  const fieldIdx = fields.findIndex((f) => f.id === field.id);
                  const sameSecFields = fields.filter((f) => f.section === field.section);
                  const posInSection = sameSecFields.findIndex((f) => f.id === field.id);

                  return (
                    <div key={field.id}>
                      {/* Field row */}
                      <div
                        className={`flex items-center gap-2 px-4 md:px-6 py-3 transition-colors ${
                          field.enabled ? "" : "opacity-40"
                        } ${isEditingThis ? "bg-accent/5" : "hover:bg-background/50"}`}
                      >
                        {/* Reorder within section */}
                        <div className="flex flex-col -my-1">
                          <button
                            onClick={() => moveFieldUp(field.id)}
                            disabled={posInSection === 0}
                            className="text-muted hover:text-foreground disabled:opacity-20 transition-colors p-0.5"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveFieldDown(field.id)}
                            disabled={posInSection === sameSecFields.length - 1}
                            className="text-muted hover:text-foreground disabled:opacity-20 transition-colors p-0.5"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Toggle visibility */}
                        <button
                          onClick={() => updateField(field.id, { enabled: !field.enabled })}
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

                        {/* Label */}
                        <span className="flex-1 text-sm font-medium truncate">
                          {field.label}
                          {field.required && <span className="text-danger ml-1">*</span>}
                        </span>

                        {/* Type badge */}
                        <span className="text-xs text-muted bg-background px-2 py-1 rounded flex-shrink-0 hidden sm:inline">
                          {FIELD_TYPE_LABELS[field.type]}
                        </span>

                        {/* Required toggle */}
                        <button
                          onClick={() => updateField(field.id, { required: !field.required })}
                          className={`flex-shrink-0 p-1 rounded transition-colors ${
                            field.required
                              ? "text-danger hover:text-danger/80"
                              : "text-muted hover:text-foreground"
                          }`}
                          title={field.required ? "Make optional" : "Make required"}
                        >
                          <Asterisk className="w-4 h-4" />
                        </button>

                        {/* Edit field settings */}
                        <button
                          onClick={() =>
                            setEditingFieldId(isEditingThis ? null : field.id)
                          }
                          className={`flex-shrink-0 p-1 rounded transition-colors ${
                            isEditingThis
                              ? "text-accent"
                              : "text-muted hover:text-foreground"
                          }`}
                          title="Edit field settings"
                        >
                          <Settings2 className="w-4 h-4" />
                        </button>

                        {/* Delete field */}
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${field.label}"?`)) deleteField(field.id);
                          }}
                          className="flex-shrink-0 p-1 rounded text-muted hover:text-danger transition-colors"
                          title="Delete field"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Expanded field editor */}
                      {isEditingThis && (
                        <div className="px-4 md:px-6 py-4 bg-accent/5 border-t border-accent/20">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                            {/* Label */}
                            <div>
                              <label className="block text-xs text-muted mb-1">Label</label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) =>
                                  updateField(field.id, { label: e.target.value })
                                }
                                className={smallInputClass}
                              />
                            </div>

                            {/* Type */}
                            <div>
                              <label className="block text-xs text-muted mb-1">Field Type</label>
                              <select
                                value={field.type}
                                onChange={(e) => {
                                  const newType = e.target.value as BuyBoxFieldType;
                                  const updates: Partial<BuyBoxField> = { type: newType };
                                  // Initialize options for select/multi-select
                                  if (
                                    (newType === "select" || newType === "multi-select") &&
                                    (!field.options || field.options.length === 0)
                                  ) {
                                    updates.options = ["Option 1", "Option 2"];
                                  }
                                  updateField(field.id, updates);
                                }}
                                className={smallInputClass}
                              >
                                {Object.entries(FIELD_TYPE_LABELS).map(([val, label]) => (
                                  <option key={val} value={val}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Placeholder (for text-like types) */}
                            {field.type !== "checkbox" &&
                              field.type !== "multi-select" &&
                              field.type !== "select" && (
                                <div className="md:col-span-2">
                                  <label className="block text-xs text-muted mb-1">
                                    Placeholder
                                  </label>
                                  <input
                                    type="text"
                                    value={field.placeholder || ""}
                                    onChange={(e) =>
                                      updateField(field.id, { placeholder: e.target.value })
                                    }
                                    className={smallInputClass}
                                    placeholder="Placeholder text..."
                                  />
                                </div>
                              )}
                          </div>

                          {/* Options editor for select/multi-select */}
                          {(field.type === "select" || field.type === "multi-select") && (
                            <div className="mt-4">
                              <label className="block text-xs text-muted mb-2">
                                Options
                              </label>
                              <div className="space-y-2 max-w-md">
                                {(field.options || []).map((opt, optIdx) => (
                                  <div key={optIdx} className="flex items-center gap-2">
                                    <GripVertical className="w-3 h-3 text-muted flex-shrink-0" />
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) =>
                                        updateOption(field.id, optIdx, e.target.value)
                                      }
                                      className={`${smallInputClass} flex-1`}
                                    />
                                    <button
                                      onClick={() => removeOption(field.id, optIdx)}
                                      className="p-1 text-muted hover:text-danger transition-colors flex-shrink-0"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => addOption(field.id)}
                                  className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors mt-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add option
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Close editor */}
                          <button
                            onClick={() => setEditingFieldId(null)}
                            className="mt-4 text-xs text-muted hover:text-foreground transition-colors"
                          >
                            Done editing
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add field button at bottom of section */}
                <button
                  onClick={() => addFieldToSection(sectionName)}
                  className="w-full px-4 md:px-6 py-3 flex items-center justify-center gap-2 text-sm text-muted hover:text-accent hover:bg-accent/5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Field
                </button>
              </div>
            </section>
          );
        })}

        {sectionOrder.length === 0 && (
          <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
            <p className="text-muted mb-4">No sections yet. Add a section to start building your form.</p>
            <button
              onClick={() => setShowAddSection(true)}
              className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add your first section
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEditing ? "Save Changes" : "Create Form"}
        </button>
        {isEditing && form?.slug && !isSystemTemplate && (
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
