"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Property } from "@/lib/types";
import PropertyCard from "./property-card";
import { Trash2, CheckSquare, Square } from "lucide-react";

interface Props {
  properties: (Property & {
    property_photos: { id: string; url: string; display_order: number }[];
  })[];
}

export default function PropertyList({ properties: initial }: Props) {
  const [properties, setProperties] = useState(initial);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === properties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(properties.map((p) => p.id)));
    }
  }

  async function deleteProperty(id: string) {
    if (!confirm("Delete this property and all its photos? This cannot be undone.")) return;
    const supabase = createClient();
    // Delete photos from storage first
    const prop = properties.find((p) => p.id === id);
    if (prop?.property_photos?.length) {
      const paths = prop.property_photos
        .map((ph) => {
          const url = ph.url;
          const match = url.match(/property-photos\/(.+)$/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[];
      if (paths.length > 0) {
        await supabase.storage.from("property-photos").remove(paths);
      }
    }
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (!error) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function bulkDelete() {
    if (selectedIds.size === 0) return;
    if (
      !confirm(
        `Delete ${selectedIds.size} propert${selectedIds.size !== 1 ? "ies" : "y"} and all their photos? This cannot be undone.`
      )
    )
      return;
    setBulkDeleting(true);
    const supabase = createClient();

    // Delete photos from storage for selected properties
    const selectedProps = properties.filter((p) => selectedIds.has(p.id));
    const allPaths: string[] = [];
    for (const prop of selectedProps) {
      if (prop.property_photos?.length) {
        for (const ph of prop.property_photos) {
          const match = ph.url.match(/property-photos\/(.+)$/);
          if (match) allPaths.push(match[1]);
        }
      }
    }
    if (allPaths.length > 0) {
      await supabase.storage.from("property-photos").remove(allPaths);
    }

    const { error } = await supabase
      .from("properties")
      .delete()
      .in("id", [...selectedIds]);
    if (!error) {
      setProperties((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
    setBulkDeleting(false);
  }

  return (
    <div>
      {/* Selection controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectionMode(!selectionMode);
              if (selectionMode) setSelectedIds(new Set());
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              selectionMode
                ? "border-accent text-accent bg-accent/10"
                : "border-border text-foreground hover:border-accent/50"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Select
          </button>
          {selectionMode && (
            <button
              onClick={toggleSelectAll}
              className="text-sm text-accent hover:underline"
            >
              {selectedIds.size === properties.length ? "Deselect all" : "Select all"}
            </button>
          )}
          {selectionMode && selectedIds.size > 0 && (
            <span className="text-sm text-muted">{selectedIds.size} selected</span>
          )}
        </div>
        {selectionMode && selectedIds.size > 0 && (
          <button
            onClick={bulkDelete}
            disabled={bulkDeleting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {bulkDeleting
              ? "Deleting..."
              : `Delete ${selectedIds.size}`}
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="relative">
            {selectionMode && (
              <button
                onClick={() => toggleSelect(property.id)}
                className="absolute top-3 left-3 z-10 w-7 h-7 rounded-lg bg-background/80 backdrop-blur flex items-center justify-center text-muted hover:text-accent transition-colors"
              >
                {selectedIds.has(property.id) ? (
                  <CheckSquare className="w-5 h-5 text-accent" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
            )}
            <PropertyCard
              property={property}
              onDelete={() => deleteProperty(property.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
