"use client";

import { Comp } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  comps: Comp[];
  onChange: (comps: Comp[]) => void;
}

export default function CompsEditor({ comps, onChange }: Props) {
  function addComp() {
    const newComp: Comp = {
      id: crypto.randomUUID(),
      property_id: "",
      address: "",
      sale_price: null,
      sqft: null,
      beds: null,
      baths: null,
      date_sold: null,
      distance: null,
      created_at: new Date().toISOString(),
    };
    onChange([...comps, newComp]);
  }

  function updateComp(index: number, field: keyof Comp, value: any) {
    const updated = [...comps];
    (updated[index] as any)[field] = value;
    onChange(updated);
  }

  function removeComp(index: number) {
    onChange(comps.filter((_, i) => i !== index));
  }

  const inputClass = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";

  return (
    <div className="space-y-4">
      {comps.map((comp, index) => (
        <div key={comp.id} className="bg-background border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted">Comp #{index + 1}</span>
            <button onClick={() => removeComp(index)} className="text-muted hover:text-danger transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={comp.address}
                onChange={(e) => updateComp(index, "address", e.target.value)}
                className={inputClass}
                placeholder="Address"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2 text-muted text-sm">$</span>
              <input
                type="number"
                value={comp.sale_price || ""}
                onChange={(e) => updateComp(index, "sale_price", e.target.value ? parseFloat(e.target.value) : null)}
                className={`${inputClass} pl-7`}
                placeholder="Sale Price"
              />
            </div>
            <div>
              <input
                type="number"
                value={comp.sqft || ""}
                onChange={(e) => updateComp(index, "sqft", e.target.value ? parseInt(e.target.value) : null)}
                className={inputClass}
                placeholder="Sqft"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={comp.beds || ""}
                onChange={(e) => updateComp(index, "beds", e.target.value ? parseInt(e.target.value) : null)}
                className={inputClass}
                placeholder="Beds"
              />
              <input
                type="number"
                value={comp.baths || ""}
                onChange={(e) => updateComp(index, "baths", e.target.value ? parseFloat(e.target.value) : null)}
                className={inputClass}
                placeholder="Baths"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={comp.date_sold || ""}
                onChange={(e) => updateComp(index, "date_sold", e.target.value || null)}
                className={inputClass}
              />
              <input
                type="text"
                value={comp.distance || ""}
                onChange={(e) => updateComp(index, "distance", e.target.value || null)}
                className={inputClass}
                placeholder="Distance"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addComp}
        className="flex items-center gap-2 text-accent hover:text-accent-hover transition-colors text-sm font-medium"
      >
        <Plus className="w-4 h-4" />
        Add Comparable Sale
      </button>
    </div>
  );
}
