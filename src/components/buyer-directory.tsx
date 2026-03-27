"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { BuyBoxSubmission } from "@/lib/buy-box-types";
import { formatCurrency } from "@/lib/calculations";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Trash2,
  Mail,
  Phone,
  Building,
  X,
  Download,
  MapPin,
  CheckSquare,
  Square,
  UserCheck,
  Plus,
  Loader2,
} from "lucide-react";
import {
  PROPERTY_TYPE_OPTIONS,
  FINANCING_TYPE_OPTIONS,
  PROPERTY_CONDITION_OPTIONS,
  CLOSING_TIMELINE_OPTIONS,
} from "@/lib/buy-box-types";

function parseLocations(locations: string | null): string[] {
  if (!locations) return [];
  try {
    const parsed = JSON.parse(locations);
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return locations.split(",").map((s) => s.trim()).filter(Boolean);
}

interface Props {
  submissions: BuyBoxSubmission[];
  formId: string;
  platformEmails?: string[];
  platformPhones?: string[];
}

export default function BuyerDirectory({ submissions: initialSubmissions, formId, platformEmails = [], platformPhones = [] }: Props) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showAddBuyer, setShowAddBuyer] = useState(false);

  // Build sets for O(1) lookup
  const platformEmailSet = useMemo(() => new Set(platformEmails.map((e) => e.toLowerCase())), [platformEmails]);
  const platformPhoneSet = useMemo(() => new Set(platformPhones), [platformPhones]);

  function isOnPlatform(sub: BuyBoxSubmission): boolean {
    if (platformEmailSet.has(sub.email.toLowerCase())) return true;
    if (sub.phone && platformPhoneSet.has(sub.phone)) return true;
    return false;
  }

  // Filters
  const [filterPropertyType, setFilterPropertyType] = useState("");
  const [filterFinancing, setFilterFinancing] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterMinBudget, setFilterMinBudget] = useState("");
  const [filterMaxBudget, setFilterMaxBudget] = useState("");
  const [filterProofOfFunds, setFilterProofOfFunds] = useState<"" | "yes" | "no">("");

  const activeFilterCount = [
    filterPropertyType,
    filterFinancing,
    filterCondition,
    filterMinBudget,
    filterMaxBudget,
    filterProofOfFunds,
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const customVals = s.custom_fields
          ? Object.values(s.custom_fields).map((cf: any) =>
              Array.isArray(cf.value) ? cf.value.join(" ") : String(cf.value ?? "")
            )
          : [];
        const searchable = [
          s.first_name,
          s.last_name,
          s.email,
          s.phone,
          s.company_name,
          ...parseLocations(s.locations),
          ...(s.property_types || []),
          ...(s.financing_types || []),
          ...customVals,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      // Property type filter
      if (filterPropertyType && !(s.property_types || []).includes(filterPropertyType)) {
        return false;
      }

      // Financing filter
      if (filterFinancing && !(s.financing_types || []).includes(filterFinancing)) {
        return false;
      }

      // Condition filter
      if (filterCondition && !(s.property_conditions || []).includes(filterCondition)) {
        return false;
      }

      // Budget filters
      if (filterMinBudget) {
        const min = parseFloat(filterMinBudget);
        if (s.max_price !== null && s.max_price < min) return false;
      }
      if (filterMaxBudget) {
        const max = parseFloat(filterMaxBudget);
        if (s.min_price !== null && s.min_price > max) return false;
      }

      // Proof of funds
      if (filterProofOfFunds === "yes" && !s.proof_of_funds) return false;
      if (filterProofOfFunds === "no" && s.proof_of_funds) return false;

      return true;
    });
  }, [
    submissions,
    searchQuery,
    filterPropertyType,
    filterFinancing,
    filterCondition,
    filterMinBudget,
    filterMaxBudget,
    filterProofOfFunds,
  ]);

  function clearFilters() {
    setFilterPropertyType("");
    setFilterFinancing("");
    setFilterCondition("");
    setFilterMinBudget("");
    setFilterMaxBudget("");
    setFilterProofOfFunds("");
  }

  async function deleteSubmission(id: string) {
    if (!confirm("Remove this buyer from your directory?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("buy_box_submissions").delete().eq("id", id);
    if (!error) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    }
  }

  async function bulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Remove ${selectedIds.size} buyer${selectedIds.size !== 1 ? "s" : ""} from your directory?`)) return;
    setBulkDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("buy_box_submissions")
      .delete()
      .in("id", [...selectedIds]);
    if (!error) {
      setSubmissions((prev) => prev.filter((s) => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
    setBulkDeleting(false);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  }

  function exportCSV() {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Company",
      "Property Types",
      "Locations",
      "Min Price",
      "Max Price",
      "Min Beds",
      "Min Baths",
      "Min Sqft",
      "Max Sqft",
      "Financing",
      "Proof of Funds",
      "Closing Timeline",
      "Conditions",
      "Deals Completed",
      "Years Experience",
      "Notes",
      "Submitted",
    ];

    // Collect all custom field labels across submissions
    const customFieldLabels: string[] = [];
    filtered.forEach((s) => {
      if (s.custom_fields) {
        Object.values(s.custom_fields).forEach((cf: any) => {
          if (cf.label && !customFieldLabels.includes(cf.label)) {
            customFieldLabels.push(cf.label);
          }
        });
      }
    });

    headers.push(...customFieldLabels);

    const rows = filtered.map((s) => {
      const row = [
        s.first_name,
        s.last_name,
        s.email,
        s.phone || "",
        s.company_name || "",
        (s.property_types || []).join("; "),
        parseLocations(s.locations).join("; "),
        s.min_price ?? "",
        s.max_price ?? "",
        s.min_beds ?? "",
        s.min_baths ?? "",
        s.min_sqft ?? "",
        s.max_sqft ?? "",
        (s.financing_types || []).join("; "),
        s.proof_of_funds ? "Yes" : "No",
        s.closing_timeline || "",
        (s.property_conditions || []).join("; "),
        s.deals_completed ?? "",
        s.years_experience ?? "",
        s.additional_notes || "",
        new Date(s.created_at).toLocaleDateString(),
      ];

      // Add custom field values
      customFieldLabels.forEach((label) => {
        const cf = s.custom_fields
          ? Object.values(s.custom_fields).find((c: any) => c.label === label)
          : null;
        if (cf) {
          const val = (cf as any).value;
          row.push(Array.isArray(val) ? val.join("; ") : String(val ?? ""));
        } else {
          row.push("");
        }
      });

      return row;
    });

    const csv = [headers, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buyer-directory.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const inputClass =
    "w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm";

  // Collect unique options for filter dropdowns
  const allPropertyTypes = [...new Set(submissions.flatMap((s) => s.property_types || []))];
  const allFinancingTypes = [...new Set(submissions.flatMap((s) => s.financing_types || []))];
  const allConditions = [...new Set(submissions.flatMap((s) => s.property_conditions || []))];

  return (
    <div className="space-y-6">
      {/* Search & Filters Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${inputClass} pl-10`}
              placeholder="Search by name, email, company, location..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "border-accent text-accent bg-accent/10"
                  : "border-border text-foreground hover:border-accent/50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-foreground hover:border-accent/50 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => {
                setSelectionMode(!selectionMode);
                if (selectionMode) setSelectedIds(new Set());
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                selectionMode
                  ? "border-accent text-accent bg-accent/10"
                  : "border-border text-foreground hover:border-accent/50"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Select
            </button>
            <button
              onClick={() => setShowAddBuyer(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Buyer
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs text-muted mb-1">Property Type</label>
                <select
                  value={filterPropertyType}
                  onChange={(e) => setFilterPropertyType(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Any</option>
                  {allPropertyTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Financing</label>
                <select
                  value={filterFinancing}
                  onChange={(e) => setFilterFinancing(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Any</option>
                  {allFinancingTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Condition</label>
                <select
                  value={filterCondition}
                  onChange={(e) => setFilterCondition(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Any</option>
                  {allConditions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Min Budget</label>
                <input
                  type="number"
                  value={filterMinBudget}
                  onChange={(e) => setFilterMinBudget(e.target.value)}
                  className={inputClass}
                  placeholder="$0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Max Budget</label>
                <input
                  type="number"
                  value={filterMaxBudget}
                  onChange={(e) => setFilterMaxBudget(e.target.value)}
                  className={inputClass}
                  placeholder="$999,999"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Proof of Funds</label>
                <select
                  value={filterProofOfFunds}
                  onChange={(e) => setFilterProofOfFunds(e.target.value as "" | "yes" | "no")}
                  className={inputClass}
                >
                  <option value="">Any</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-3 flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count & bulk actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {selectionMode && (
            <button
              onClick={toggleSelectAll}
              className="text-sm text-accent hover:underline"
            >
              {selectedIds.size === filtered.length ? "Deselect all" : "Select all"}
            </button>
          )}
          <p className="text-sm text-muted">
            {selectionMode && selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : `${filtered.length} buyer${filtered.length !== 1 ? "s" : ""} ${
                  searchQuery || activeFilterCount > 0 ? "(filtered)" : "total"
                }`}
          </p>
        </div>
        {selectionMode && selectedIds.size > 0 && (
          <button
            onClick={bulkDelete}
            disabled={bulkDeleting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-danger text-white text-sm font-medium hover:bg-danger/90 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {bulkDeleting ? "Deleting..." : `Delete ${selectedIds.size}`}
          </button>
        )}
      </div>

      {/* Submissions List */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <p className="text-muted text-lg">
            {submissions.length === 0
              ? "No submissions yet. Share your form link with buyers to start building your directory."
              : "No buyers match your search or filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => {
            const isExpanded = expandedId === sub.id;
            return (
              <div
                key={sub.id}
                className="bg-card border border-border rounded-2xl overflow-hidden transition-colors hover:border-border/80"
              >
                {/* Summary Row */}
                <div
                  className="w-full flex items-center gap-4 p-4 md:p-5 text-left"
                >
                  {/* Checkbox for selection mode */}
                  {selectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(sub.id);
                      }}
                      className="flex-shrink-0 text-muted hover:text-accent transition-colors"
                    >
                      {selectedIds.has(sub.id) ? (
                        <CheckSquare className="w-5 h-5 text-accent" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  )}

                  {/* Clickable area */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                    className="flex-1 flex items-center gap-4 min-w-0"
                  >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold flex-shrink-0 relative">
                    {sub.first_name[0]}
                    {sub.last_name[0]}
                    {isOnPlatform(sub) && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center" title="On REI Reach">
                        <UserCheck className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">
                        {sub.first_name} {sub.last_name}
                      </span>
                      {isOnPlatform(sub) && (
                        <span className="px-2 py-0.5 rounded-full bg-success/15 text-success text-xs font-medium flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          On Platform
                        </span>
                      )}
                      {sub.company_name && (
                        <span className="text-muted text-sm">({sub.company_name})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {sub.email}
                      </span>
                      {sub.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {sub.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="hidden md:flex items-center gap-2 flex-wrap max-w-[300px]">
                    {(sub.property_types || []).slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-1 rounded bg-accent/10 text-accent text-xs"
                      >
                        {t}
                      </span>
                    ))}
                    {sub.max_price && (
                      <span className="px-2 py-1 rounded bg-success/10 text-success text-xs">
                        up to {formatCurrency(sub.max_price)}
                      </span>
                    )}
                    {sub.proof_of_funds && (
                      <span className="px-2 py-1 rounded bg-success/10 text-success text-xs">
                        POF
                      </span>
                    )}
                  </div>

                  {/* Expand icon */}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted flex-shrink-0" />
                  )}
                  </button>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-4 md:px-5 pb-5 border-t border-border pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Contact */}
                      <DetailSection title="Contact">
                        <DetailRow label="Name" value={`${sub.first_name} ${sub.last_name}`} />
                        <DetailRow label="Email" value={sub.email} isLink={`mailto:${sub.email}`} />
                        {sub.phone && <DetailRow label="Phone" value={sub.phone} isLink={`tel:${sub.phone}`} />}
                        {sub.company_name && <DetailRow label="Company" value={sub.company_name} />}
                      </DetailSection>

                      {/* Criteria */}
                      <DetailSection title="Investment Criteria">
                        {(sub.property_types || []).length > 0 && (
                          <DetailRow label="Property Types" value={(sub.property_types || []).join(", ")} />
                        )}
                        {sub.locations && parseLocations(sub.locations).length > 0 && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-muted flex-shrink-0 w-28">Locations:</span>
                            <div className="flex flex-wrap gap-1">
                              {parseLocations(sub.locations).map((loc) => (
                                <span
                                  key={loc}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent/10 text-accent text-xs"
                                >
                                  <MapPin className="w-3 h-3" />
                                  {loc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {(sub.min_price || sub.max_price) && (
                          <DetailRow
                            label="Budget"
                            value={`${sub.min_price ? formatCurrency(sub.min_price) : "Any"} - ${
                              sub.max_price ? formatCurrency(sub.max_price) : "Any"
                            }`}
                          />
                        )}
                        {sub.min_beds && <DetailRow label="Min Beds" value={sub.min_beds.toString()} />}
                        {sub.min_baths && <DetailRow label="Min Baths" value={sub.min_baths.toString()} />}
                        {(sub.min_sqft || sub.max_sqft) && (
                          <DetailRow
                            label="Sqft"
                            value={`${sub.min_sqft || "Any"} - ${sub.max_sqft || "Any"}`}
                          />
                        )}
                      </DetailSection>

                      {/* Financing & Conditions */}
                      <DetailSection title="Financing & Experience">
                        {(sub.financing_types || []).length > 0 && (
                          <DetailRow label="Financing" value={(sub.financing_types || []).join(", ")} />
                        )}
                        <DetailRow label="Proof of Funds" value={sub.proof_of_funds ? "Yes" : "No"} />
                        {sub.closing_timeline && (
                          <DetailRow label="Closing Timeline" value={sub.closing_timeline} />
                        )}
                        {(sub.property_conditions || []).length > 0 && (
                          <DetailRow
                            label="Conditions"
                            value={(sub.property_conditions || []).join(", ")}
                          />
                        )}
                        {sub.deals_completed != null && (
                          <DetailRow label="Deals Completed" value={sub.deals_completed.toString()} />
                        )}
                        {sub.years_experience != null && (
                          <DetailRow label="Years Experience" value={sub.years_experience.toString()} />
                        )}
                      </DetailSection>
                    </div>

                    {sub.additional_notes && (
                      <div className="mt-4 p-3 bg-background rounded-lg">
                        <p className="text-xs text-muted mb-1">Notes</p>
                        <p className="text-sm">{sub.additional_notes}</p>
                      </div>
                    )}

                    {/* Custom fields */}
                    {sub.custom_fields && Object.keys(sub.custom_fields).length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-xs text-muted uppercase tracking-wider font-semibold mb-2">Additional Info</h4>
                        <div className="space-y-1.5">
                          {Object.entries(sub.custom_fields).map(([key, cf]: [string, any]) => (
                            <DetailRow
                              key={key}
                              label={cf.label || key}
                              value={
                                Array.isArray(cf.value)
                                  ? cf.value.join(", ")
                                  : typeof cf.value === "boolean"
                                  ? cf.value ? "Yes" : "No"
                                  : String(cf.value)
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                      <p className="text-xs text-muted">
                        Submitted {new Date(sub.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      <button
                        onClick={() => deleteSubmission(sub.id)}
                        className="flex items-center gap-1 text-sm text-danger hover:text-danger/80 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Buyer Modal */}
      {showAddBuyer && (
        <AddBuyerModal
          formId={formId}
          onClose={() => setShowAddBuyer(false)}
          onAdded={(sub) => {
            setSubmissions((prev) => [sub, ...prev]);
            setShowAddBuyer(false);
          }}
        />
      )}
    </div>
  );
}

function AddBuyerModal({
  formId,
  onClose,
  onAdded,
}: {
  formId: string;
  onClose: () => void;
  onAdded: (sub: BuyBoxSubmission) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Record<string, any>>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company_name: "",
    property_types: [] as string[],
    locations: "",
    min_price: "",
    max_price: "",
    min_beds: "",
    min_baths: "",
    min_sqft: "",
    max_sqft: "",
    financing_types: [] as string[],
    proof_of_funds: false,
    closing_timeline: "",
    property_conditions: [] as string[],
    deals_completed: "",
    years_experience: "",
    additional_notes: "",
  });

  function update(field: string, value: any) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleMulti(field: string, option: string) {
    setFormData((prev) => {
      const current: string[] = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(option)
          ? current.filter((o: string) => o !== option)
          : [...current, option],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
      setError("First name, last name, and email are required.");
      return;
    }
    setSaving(true);
    setError("");

    const submission: Record<string, any> = {
      form_id: formId,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      company_name: formData.company_name.trim() || null,
      property_types: formData.property_types,
      locations: formData.locations.trim() || null,
      min_price: formData.min_price ? parseFloat(formData.min_price) : null,
      max_price: formData.max_price ? parseFloat(formData.max_price) : null,
      min_beds: formData.min_beds ? parseInt(formData.min_beds) : null,
      min_baths: formData.min_baths ? parseInt(formData.min_baths) : null,
      min_sqft: formData.min_sqft ? parseInt(formData.min_sqft) : null,
      max_sqft: formData.max_sqft ? parseInt(formData.max_sqft) : null,
      financing_types: formData.financing_types,
      proof_of_funds: formData.proof_of_funds,
      closing_timeline: formData.closing_timeline || null,
      property_conditions: formData.property_conditions,
      deals_completed: formData.deals_completed ? parseInt(formData.deals_completed) : null,
      years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
      additional_notes: formData.additional_notes.trim() || null,
    };

    try {
      const supabase = createClient();
      const { data, error: insertError } = await supabase
        .from("buy_box_submissions")
        .insert(submission)
        .select()
        .single();
      if (insertError) throw insertError;
      onAdded(data as BuyBoxSubmission);
    } catch (err: any) {
      setError(err.message || "Failed to add buyer.");
      setSaving(false);
    }
  }

  const inputClass =
    "w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold">Add Buyer</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">First Name <span className="text-danger">*</span></label>
                <input type="text" value={formData.first_name} onChange={(e) => update("first_name", e.target.value)} className={inputClass} placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name <span className="text-danger">*</span></label>
                <input type="text" value={formData.last_name} onChange={(e) => update("last_name", e.target.value)} className={inputClass} placeholder="Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email <span className="text-danger">*</span></label>
                <input type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} placeholder="(555) 123-4567" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Company</label>
                <input type="text" value={formData.company_name} onChange={(e) => update("company_name", e.target.value)} className={inputClass} placeholder="Acme Investments LLC" />
              </div>
            </div>
          </div>

          {/* Investment Criteria */}
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Investment Criteria</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Property Types</label>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleMulti("property_types", opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                        formData.property_types.includes(opt)
                          ? "bg-primary text-white border-accent"
                          : "bg-background border-border text-foreground hover:border-accent/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Locations</label>
                <input type="text" value={formData.locations} onChange={(e) => update("locations", e.target.value)} className={inputClass} placeholder="Miami, Tampa, Orlando..." />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Price</label>
                  <input type="number" value={formData.min_price} onChange={(e) => update("min_price", e.target.value)} className={inputClass} placeholder="$50,000" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Price</label>
                  <input type="number" value={formData.max_price} onChange={(e) => update("max_price", e.target.value)} className={inputClass} placeholder="$500,000" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Beds</label>
                  <input type="number" value={formData.min_beds} onChange={(e) => update("min_beds", e.target.value)} className={inputClass} placeholder="2" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Baths</label>
                  <input type="number" value={formData.min_baths} onChange={(e) => update("min_baths", e.target.value)} className={inputClass} placeholder="1" min="0" />
                </div>
              </div>
            </div>
          </div>

          {/* Financing */}
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Financing</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Financing Types</label>
                <div className="flex flex-wrap gap-2">
                  {FINANCING_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleMulti("financing_types", opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                        formData.financing_types.includes(opt)
                          ? "bg-primary text-white border-accent"
                          : "bg-background border-border text-foreground hover:border-accent/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Closing Timeline</label>
                  <select value={formData.closing_timeline} onChange={(e) => update("closing_timeline", e.target.value)} className={inputClass}>
                    <option value="">Select...</option>
                    {CLOSING_TIMELINE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.proof_of_funds} onChange={(e) => update("proof_of_funds", e.target.checked)} className="w-4 h-4 rounded border-border text-accent focus:ring-accent" />
                    <span className="text-sm">Proof of Funds Available</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Property Conditions</h3>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_CONDITION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleMulti("property_conditions", opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                    formData.property_conditions.includes(opt)
                      ? "bg-primary text-white border-accent"
                      : "bg-background border-border text-foreground hover:border-accent/50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Experience & Notes */}
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Experience & Notes</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Deals Completed</label>
                <input type="number" value={formData.deals_completed} onChange={(e) => update("deals_completed", e.target.value)} className={inputClass} placeholder="0" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Years Experience</label>
                <input type="number" value={formData.years_experience} onChange={(e) => update("years_experience", e.target.value)} className={inputClass} placeholder="0" min="0" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea value={formData.additional_notes} onChange={(e) => update("additional_notes", e.target.value)} className={`${inputClass} min-h-[80px]`} placeholder="Any additional info about this buyer..." />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg border border-border text-foreground hover:border-accent/50 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? "Adding..." : "Add Buyer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs text-muted uppercase tracking-wider font-semibold mb-2">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  isLink,
}: {
  label: string;
  value: string;
  isLink?: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-muted flex-shrink-0 w-28">{label}:</span>
      {isLink ? (
        <a href={isLink} className="text-accent hover:underline break-all">
          {value}
        </a>
      ) : (
        <span className="break-all">{value}</span>
      )}
    </div>
  );
}
