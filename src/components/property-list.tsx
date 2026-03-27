"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Property } from "@/lib/types";
import PropertyCard from "./property-card";
import { Trash2, CheckSquare, Square, Archive } from "lucide-react";

type SellerStatus = Property["seller_status"];

const STATUS_TABS: { key: SellerStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "sold", label: "Sold" },
  { key: "archived", label: "Archived" },
];

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
  const [activeTab, setActiveTab] = useState<SellerStatus | "all">("all");

  const filteredProperties = activeTab === "all"
    ? properties.filter((p) => (p.seller_status || "active") !== "archived")
    : properties.filter((p) => (p.seller_status || "active") === activeTab);

  const counts = properties.reduce(
    (acc, p) => {
      const s = p.seller_status || "active";
      acc[s] = (acc[s] || 0) + 1;
      acc.all = (acc.all || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const visibleIds = filteredProperties.map((p) => p.id);
    if (visibleIds.every((id) => selectedIds.has(id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleIds));
    }
  }

  async function updateSellerStatus(propertyId: string, status: SellerStatus) {
    const res = await fetch("/api/properties/seller-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: propertyId, seller_status: status }),
    });
    if (res.ok) {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId ? { ...p, seller_status: status } : p
        )
      );
    }
  }

  async function deleteProperty(id: string) {
    if (!confirm("Delete this property and all its photos? This cannot be undone.")) return;
    const supabase = createClient();
    const prop = properties.find((p) => p.id === id);
    if (prop?.property_photos?.length) {
      const paths = prop.property_photos
        .map((ph) => {
          const match = ph.url.match(/property-photos\/(.+)$/);
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
      {/* Status filter tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const count = counts[tab.key] || 0;
          // For "all" tab, subtract archived from total count since we hide them by default
          const displayCount = tab.key === "all"
            ? (counts.all || 0) - (counts.archived || 0)
            : count;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSelectedIds(new Set());
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.key === "archived" && <Archive className="w-3.5 h-3.5" />}
              {tab.label}
              {displayCount > 0 && (
                <span className="text-xs bg-border/60 px-1.5 py-0.5 rounded-full">
                  {displayCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

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
              {filteredProperties.every((p) => selectedIds.has(p.id)) && filteredProperties.length > 0
                ? "Deselect all"
                : "Select all"}
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

      {filteredProperties.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <p className="text-muted">
            {activeTab === "archived"
              ? "No archived properties"
              : activeTab === "pending"
              ? "No pending properties"
              : activeTab === "sold"
              ? "No sold properties"
              : "No properties found"}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
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
                onStatusChange={updateSellerStatus}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
