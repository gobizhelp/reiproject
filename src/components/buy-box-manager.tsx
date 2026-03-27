"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BuyerBuyBox } from "@/lib/profile-types";
import {
  PROPERTY_TYPE_OPTIONS, FINANCING_TYPE_OPTIONS,
  PROPERTY_CONDITION_OPTIONS, CLOSING_TIMELINE_OPTIONS,
} from "@/lib/buy-box-types";
import {
  Plus, Trash2, Edit3, X, Save, Loader2, Package, ChevronDown, ChevronUp, MapPin
} from "lucide-react";
import CitySearchSelect from "@/components/city-search-select";

interface Props {
  buyBoxes: BuyerBuyBox[];
  userId: string;
}

type BuyBoxFormData = Omit<BuyerBuyBox, "id" | "user_id" | "created_at" | "updated_at"> & {
  locations_list: string[];
};

function parseLocations(locations: string | null): string[] {
  if (!locations) return [];
  try {
    const parsed = JSON.parse(locations);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  // Fallback: treat as comma-separated
  return locations.split(",").map((s) => s.trim()).filter(Boolean);
}

function serializeLocations(list: string[]): string | null {
  return list.length > 0 ? JSON.stringify(list) : null;
}

const emptyForm: BuyBoxFormData = {
  name: "",
  property_types: [],
  locations: null,
  locations_list: [],
  min_price: null,
  max_price: null,
  min_beds: null,
  min_baths: null,
  min_sqft: null,
  max_sqft: null,
  financing_types: [],
  closing_timeline: null,
  property_conditions: [],
  additional_notes: null,
};

export default function BuyBoxManager({ buyBoxes: initialBoxes, userId }: Props) {
  const [buyBoxes, setBuyBoxes] = useState(initialBoxes);
  const [editing, setEditing] = useState<string | null>(null); // buy box id or "new"
  const [form, setForm] = useState<BuyBoxFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedBox, setExpandedBox] = useState<string | null>(null);
  const router = useRouter();

  function startNew() {
    setEditing("new");
    setForm({ ...emptyForm, name: `Buy Box ${buyBoxes.length + 1}` });
  }

  function startEdit(box: BuyerBuyBox) {
    setEditing(box.id);
    setForm({
      name: box.name,
      property_types: box.property_types || [],
      locations: box.locations,
      locations_list: parseLocations(box.locations),
      min_price: box.min_price,
      max_price: box.max_price,
      min_beds: box.min_beds,
      min_baths: box.min_baths,
      min_sqft: box.min_sqft,
      max_sqft: box.max_sqft,
      financing_types: box.financing_types || [],
      closing_timeline: box.closing_timeline,
      property_conditions: box.property_conditions || [],
      additional_notes: box.additional_notes,
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    const supabase = createClient();

    const payload = {
      user_id: userId,
      name: form.name.trim(),
      property_types: form.property_types,
      locations: serializeLocations(form.locations_list),
      min_price: form.min_price || null,
      max_price: form.max_price || null,
      min_beds: form.min_beds || null,
      min_baths: form.min_baths || null,
      min_sqft: form.min_sqft || null,
      max_sqft: form.max_sqft || null,
      financing_types: form.financing_types,
      closing_timeline: form.closing_timeline || null,
      property_conditions: form.property_conditions,
      additional_notes: form.additional_notes || null,
    };

    if (editing === "new") {
      const { data, error } = await supabase
        .from("buyer_buy_boxes")
        .insert(payload)
        .select()
        .single();
      if (data) {
        setBuyBoxes([data as BuyerBuyBox, ...buyBoxes]);
      }
    } else {
      const { data, error } = await supabase
        .from("buyer_buy_boxes")
        .update(payload)
        .eq("id", editing!)
        .select()
        .single();
      if (data) {
        setBuyBoxes(buyBoxes.map((b) => b.id === editing ? data as BuyerBuyBox : b));
      }
    }

    setSaving(false);
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("buyer_buy_boxes").delete().eq("id", id);
    setBuyBoxes(buyBoxes.filter((b) => b.id !== id));
    setDeleting(null);
  }

  function toggleMultiSelect(field: "property_types" | "financing_types" | "property_conditions", value: string) {
    const arr = form[field] || [];
    if (arr.includes(value)) {
      setForm({ ...form, [field]: arr.filter((v) => v !== value) });
    } else {
      setForm({ ...form, [field]: [...arr, value] });
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Buy Boxes</h1>
          <p className="text-muted mt-1">Define your investment criteria to match with deals</p>
        </div>
        {editing === null && (
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Buy Box
          </button>
        )}
      </div>

      {/* Edit / New Form */}
      {editing !== null && (
        <div className="bg-card border border-accent/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {editing === "new" ? "Create Buy Box" : "Edit Buy Box"}
            </h2>
            <button onClick={cancelEdit} className="text-muted hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Buy Box Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="e.g. DMV Flips, South Florida Rentals"
              />
            </div>

            {/* Property Types */}
            <div>
              <label className="block text-sm font-medium mb-2">Property Types</label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleMultiSelect("property_types", type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      form.property_types.includes(type)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-background text-muted hover:text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div>
              <label className="block text-sm font-medium mb-2">Target Markets / Areas</label>
              <CitySearchSelect
                value={form.locations_list}
                onChange={(cities) => setForm({ ...form, locations_list: cities })}
                placeholder="Search for a city..."
              />
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Min Price</label>
                <input
                  type="number"
                  value={form.min_price ?? ""}
                  onChange={(e) => setForm({ ...form, min_price: e.target.value ? Number(e.target.value) : null })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="$0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Price</label>
                <input
                  type="number"
                  value={form.max_price ?? ""}
                  onChange={(e) => setForm({ ...form, max_price: e.target.value ? Number(e.target.value) : null })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="No max"
                />
              </div>
            </div>

            {/* Beds / Baths / Sqft */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Min Beds</label>
                <input
                  type="number"
                  value={form.min_beds ?? ""}
                  onChange={(e) => setForm({ ...form, min_beds: e.target.value ? Number(e.target.value) : null })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Min Baths</label>
                <input
                  type="number"
                  value={form.min_baths ?? ""}
                  onChange={(e) => setForm({ ...form, min_baths: e.target.value ? Number(e.target.value) : null })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Min Sqft</label>
                <input
                  type="number"
                  value={form.min_sqft ?? ""}
                  onChange={(e) => setForm({ ...form, min_sqft: e.target.value ? Number(e.target.value) : null })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Sqft</label>
                <input
                  type="number"
                  value={form.max_sqft ?? ""}
                  onChange={(e) => setForm({ ...form, max_sqft: e.target.value ? Number(e.target.value) : null })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Any"
                />
              </div>
            </div>

            {/* Financing Types */}
            <div>
              <label className="block text-sm font-medium mb-2">Financing Methods</label>
              <div className="flex flex-wrap gap-2">
                {FINANCING_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleMultiSelect("financing_types", type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      form.financing_types.includes(type)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-background text-muted hover:text-foreground"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Closing Timeline */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Closing Timeline</label>
                <select
                  value={form.closing_timeline || ""}
                  onChange={(e) => setForm({ ...form, closing_timeline: e.target.value || null })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground"
                >
                  <option value="">Select...</option>
                  {CLOSING_TIMELINE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Property Conditions */}
            <div>
              <label className="block text-sm font-medium mb-2">Acceptable Property Conditions</label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_CONDITION_OPTIONS.map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleMultiSelect("property_conditions", cond)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      form.property_conditions.includes(cond)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-background text-muted hover:text-foreground"
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Additional Notes</label>
              <textarea
                value={form.additional_notes || ""}
                onChange={(e) => setForm({ ...form, additional_notes: e.target.value })}
                rows={3}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Any other criteria or preferences..."
              />
            </div>

            {/* Save */}
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelEdit}
                className="px-5 py-2.5 rounded-lg border border-border text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editing === "new" ? "Create" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buy Box List */}
      {buyBoxes.length === 0 && editing === null ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <Package className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted text-lg mb-2">No buy boxes yet</p>
          <p className="text-muted text-sm mb-6">Create a buy box to define your investment criteria</p>
          <button
            onClick={startNew}
            className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
          >
            <Plus className="w-4 h-4" />
            Create your first buy box
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {buyBoxes.map((box) => (
            <div
              key={box.id}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedBox(expandedBox === box.id ? null : box.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div>
                  <h3 className="font-bold text-lg">{box.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {box.property_types?.length > 0 && (
                      <span className="text-xs text-muted bg-background px-2 py-0.5 rounded">
                        {box.property_types.join(", ")}
                      </span>
                    )}
                    {(box.min_price || box.max_price) && (
                      <span className="text-xs text-muted bg-background px-2 py-0.5 rounded">
                        {box.min_price ? `$${box.min_price.toLocaleString()}` : "$0"}
                        {" – "}
                        {box.max_price ? `$${box.max_price.toLocaleString()}` : "No max"}
                      </span>
                    )}
                    {box.locations && parseLocations(box.locations).slice(0, 2).map((loc) => (
                      <span key={loc} className="inline-flex items-center gap-1 text-xs text-muted bg-background px-2 py-0.5 rounded">
                        <MapPin className="w-3 h-3" />
                        {loc}
                      </span>
                    ))}
                    {box.locations && parseLocations(box.locations).length > 2 && (
                      <span className="text-xs text-muted bg-background px-2 py-0.5 rounded">
                        +{parseLocations(box.locations).length - 2} more
                      </span>
                    )}
                  </div>
                </div>
                {expandedBox === box.id ? (
                  <ChevronUp className="w-5 h-5 text-muted shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted shrink-0" />
                )}
              </button>

              {expandedBox === box.id && (
                <div className="border-t border-border p-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                    {box.min_beds != null && (
                      <div><span className="text-muted">Min Beds:</span> <span className="font-medium">{box.min_beds}</span></div>
                    )}
                    {box.min_baths != null && (
                      <div><span className="text-muted">Min Baths:</span> <span className="font-medium">{box.min_baths}</span></div>
                    )}
                    {box.min_sqft != null && (
                      <div><span className="text-muted">Min Sqft:</span> <span className="font-medium">{box.min_sqft.toLocaleString()}</span></div>
                    )}
                    {box.max_sqft != null && (
                      <div><span className="text-muted">Max Sqft:</span> <span className="font-medium">{box.max_sqft.toLocaleString()}</span></div>
                    )}
                    {box.financing_types?.length > 0 && (
                      <div><span className="text-muted">Financing:</span> <span className="font-medium">{box.financing_types.join(", ")}</span></div>
                    )}
                    {box.closing_timeline && (
                      <div><span className="text-muted">Closing:</span> <span className="font-medium">{box.closing_timeline}</span></div>
                    )}
                    {box.property_conditions?.length > 0 && (
                      <div className="col-span-2"><span className="text-muted">Conditions:</span> <span className="font-medium">{box.property_conditions.join(", ")}</span></div>
                    )}
                  </div>
                  {box.additional_notes && (
                    <div className="text-sm mb-4">
                      <span className="text-muted">Notes:</span>
                      <p className="mt-1">{box.additional_notes}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(box)}
                      className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline font-medium"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(box.id)}
                      disabled={deleting === box.id}
                      className="inline-flex items-center gap-1.5 text-sm text-danger hover:underline font-medium"
                    >
                      {deleting === box.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
