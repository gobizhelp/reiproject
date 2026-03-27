"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Property, Comp } from "@/lib/types";
import { calculateDealAnalysis, formatCurrency, formatPercent, formatCurrencyRange } from "@/lib/calculations";
import PhotoUpload from "./photo-upload";
import CompsEditor from "./comps-editor";
import ListingTemplatePicker from "./listing-template-picker";
import { Loader2, Save, Send, FileText } from "lucide-react";

interface Props {
  property?: Property & { property_photos: any[]; comps: Comp[] };
  hasTemplatesAccess?: boolean;
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
];

const INVESTOR_STRATEGIES = [
  "Fix & Flip", "BRRRR", "Buy & Hold", "Wholesale", "Creative Finance",
  "Section 8", "Short-Term Rental", "Owner Finance", "Subject To", "Land Development"
];

const PROPERTY_TYPES = [
  "Single Family", "Multi Family", "Townhouse", "Condo", "Duplex",
  "Triplex", "Fourplex", "Mobile Home", "Land", "Commercial", "Other"
];

export default function PropertyForm({ property, hasTemplatesAccess }: Props) {
  const router = useRouter();
  const isEditing = !!property;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  // Title & Address
  const [title, setTitle] = useState(property?.title || "");
  const [streetAddress, setStreetAddress] = useState(property?.street_address || "");
  const [city, setCity] = useState(property?.city || "");
  const [state, setState] = useState(property?.state || "");
  const [zipCode, setZipCode] = useState(property?.zip_code || "");

  // Property Info
  const [listingStatus, setListingStatus] = useState(property?.listing_status || "off_market");
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>(
    property?.ideal_investor_strategy ? property.ideal_investor_strategy.split(", ").filter(Boolean) : []
  );
  const [propertyType, setPropertyType] = useState(property?.property_type || "Single Family");
  const [beds, setBeds] = useState(property?.beds?.toString() || "");
  const [baths, setBaths] = useState(property?.baths?.toString() || "");
  const [sqft, setSqft] = useState(property?.sqft?.toString() || "");
  const [yearBuilt, setYearBuilt] = useState(property?.year_built?.toString() || "");
  const [lotSize, setLotSize] = useState(property?.lot_size || "");
  const [basementDescription, setBasementDescription] = useState(property?.basement_description || "");
  const [neighborhoodNotes, setNeighborhoodNotes] = useState(property?.neighborhood_notes || "");
  const [conditionSummary, setConditionSummary] = useState(property?.condition_summary || "");
  const [compsSummary, setCompsSummary] = useState(property?.comps_summary || "");

  // Financials
  const [askingPrice, setAskingPrice] = useState(property?.asking_price?.toString() || "");
  const [arv, setArv] = useState(property?.arv?.toString() || "");
  const [repairEstimate, setRepairEstimate] = useState(property?.repair_estimate?.toString() || "");
  const [assignmentFee, setAssignmentFee] = useState(property?.assignment_fee?.toString() || "");
  const [showAssignmentFee, setShowAssignmentFee] = useState(property?.show_assignment_fee ?? false);

  // Rehab Budgets
  const [lightRehabBudgetLow, setLightRehabBudgetLow] = useState(property?.light_rehab_budget_low?.toString() || "");
  const [lightRehabBudgetHigh, setLightRehabBudgetHigh] = useState(property?.light_rehab_budget_high?.toString() || "");
  const [fullRehabBudgetLow, setFullRehabBudgetLow] = useState(property?.full_rehab_budget_low?.toString() || "");
  const [fullRehabBudgetHigh, setFullRehabBudgetHigh] = useState(property?.full_rehab_budget_high?.toString() || "");

  // ARVs
  const [lightRehabArv, setLightRehabArv] = useState(property?.light_rehab_arv?.toString() || "");
  const [fullRehabArvLow, setFullRehabArvLow] = useState(property?.full_rehab_arv_low?.toString() || "");
  const [fullRehabArvHigh, setFullRehabArvHigh] = useState(property?.full_rehab_arv_high?.toString() || "");

  // Rental Projections
  const [rentAfterRenoLow, setRentAfterRenoLow] = useState(property?.rent_after_reno_low?.toString() || "");
  const [rentAfterRenoHigh, setRentAfterRenoHigh] = useState(property?.rent_after_reno_high?.toString() || "");
  const [rentAfterRenoBasementLow, setRentAfterRenoBasementLow] = useState(property?.rent_after_reno_basement_low?.toString() || "");
  const [rentAfterRenoBasementHigh, setRentAfterRenoBasementHigh] = useState(property?.rent_after_reno_basement_high?.toString() || "");

  // Deal Narrative
  const [renovationOverview, setRenovationOverview] = useState(property?.renovation_overview || "");
  const [whyDealIsStrong, setWhyDealIsStrong] = useState(property?.why_deal_is_strong || "");

  // Contact
  const [showingInstructions, setShowingInstructions] = useState(property?.showing_instructions || "");
  const [contactName, setContactName] = useState(property?.contact_name || "");
  const [contactPhone, setContactPhone] = useState(property?.contact_phone || "");
  const [contactEmail, setContactEmail] = useState(property?.contact_email || "");

  const [photos, setPhotos] = useState<any[]>(property?.property_photos || []);
  const [comps, setComps] = useState<Comp[]>(property?.comps || []);

  // Deal analysis
  const analysis = calculateDealAnalysis(
    parseFloat(arv) || null,
    parseFloat(askingPrice) || null,
    parseFloat(repairEstimate) || null,
    parseFloat(assignmentFee) || null,
    parseFloat(lightRehabBudgetLow) || null,
    parseFloat(lightRehabBudgetHigh) || null,
    parseFloat(fullRehabBudgetLow) || null,
    parseFloat(fullRehabBudgetHigh) || null,
    parseFloat(lightRehabArv) || null,
    parseFloat(fullRehabArvLow) || null,
    parseFloat(fullRehabArvHigh) || null,
  );

  function applyTemplate(data: Record<string, unknown>) {
    if (data.listing_status) setListingStatus(data.listing_status as string);
    if (data.ideal_investor_strategy) {
      setSelectedStrategies((data.ideal_investor_strategy as string).split(", ").filter(Boolean));
    }
    if (data.property_type) setPropertyType(data.property_type as string);
    if (data.city) setCity(data.city as string);
    if (data.state) setState(data.state as string);
    if (data.zip_code) setZipCode(data.zip_code as string);
    if (data.contact_name) setContactName(data.contact_name as string);
    if (data.contact_phone) setContactPhone(data.contact_phone as string);
    if (data.contact_email) setContactEmail(data.contact_email as string);
    if (data.showing_instructions) setShowingInstructions(data.showing_instructions as string);
    setShowTemplatePicker(false);
  }

  async function saveAsTemplate() {
    const templateName = prompt("Enter a name for this template:");
    if (!templateName) return;
    setSavingTemplate(true);
    setTemplateSaved(false);

    const body: Record<string, unknown> = { name: templateName };
    if (isEditing && property) {
      body.property_id = property.id;
    } else {
      body.template_data = {
        listing_status: listingStatus,
        ideal_investor_strategy: selectedStrategies.join(", "),
        property_type: propertyType,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        showing_instructions: showingInstructions,
      };
    }

    const res = await fetch("/api/listing-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setTemplateSaved(true);
      setTimeout(() => setTemplateSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save template");
    }
    setSavingTemplate(false);
  }

  function generateSlug(address: string, city: string): string {
    return `${address}-${city}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) + "-" + Math.random().toString(36).slice(2, 8);
  }

  async function handleSubmit(status: "draft" | "published") {
    if (!title) {
      setError("Please enter a property nickname / title.");
      return;
    }
    if (!streetAddress || !city || !state || !zipCode) {
      setError("Please fill in the property address fields.");
      return;
    }

    setLoading(true);
    setError("");

    const propertyData = {
      title: title || null,
      street_address: streetAddress,
      city,
      state,
      zip_code: zipCode,
      listing_status: listingStatus,
      ideal_investor_strategy: selectedStrategies.length > 0 ? selectedStrategies.join(", ") : null,
      property_type: propertyType,
      beds: beds ? parseInt(beds) : null,
      baths: baths ? parseFloat(baths) : null,
      sqft: sqft ? parseInt(sqft) : null,
      year_built: yearBuilt ? parseInt(yearBuilt) : null,
      lot_size: lotSize || null,
      basement_description: basementDescription || null,
      neighborhood_notes: neighborhoodNotes || null,
      condition_summary: conditionSummary || null,
      comps_summary: compsSummary || null,
      asking_price: askingPrice ? parseFloat(askingPrice) : null,
      arv: arv ? parseFloat(arv) : null,
      repair_estimate: repairEstimate ? parseFloat(repairEstimate) : null,
      assignment_fee: assignmentFee ? parseFloat(assignmentFee) : null,
      show_assignment_fee: showAssignmentFee,
      light_rehab_budget_low: lightRehabBudgetLow ? parseFloat(lightRehabBudgetLow) : null,
      light_rehab_budget_high: lightRehabBudgetHigh ? parseFloat(lightRehabBudgetHigh) : null,
      full_rehab_budget_low: fullRehabBudgetLow ? parseFloat(fullRehabBudgetLow) : null,
      full_rehab_budget_high: fullRehabBudgetHigh ? parseFloat(fullRehabBudgetHigh) : null,
      light_rehab_arv: lightRehabArv ? parseFloat(lightRehabArv) : null,
      full_rehab_arv_low: fullRehabArvLow ? parseFloat(fullRehabArvLow) : null,
      full_rehab_arv_high: fullRehabArvHigh ? parseFloat(fullRehabArvHigh) : null,
      rent_after_reno_low: rentAfterRenoLow ? parseFloat(rentAfterRenoLow) : null,
      rent_after_reno_high: rentAfterRenoHigh ? parseFloat(rentAfterRenoHigh) : null,
      rent_after_reno_basement_low: rentAfterRenoBasementLow ? parseFloat(rentAfterRenoBasementLow) : null,
      rent_after_reno_basement_high: rentAfterRenoBasementHigh ? parseFloat(rentAfterRenoBasementHigh) : null,
      renovation_overview: renovationOverview || null,
      why_deal_is_strong: whyDealIsStrong || null,
      showing_instructions: showingInstructions || null,
      contact_name: contactName || null,
      contact_phone: contactPhone || null,
      contact_email: contactEmail || null,
      status,
    };

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    try {
      if (isEditing) {
        const updateData: Record<string, unknown> = { ...propertyData, updated_at: new Date().toISOString() };
        // Set published_at when first publishing
        if (status === "published" && !property.published_at) {
          updateData.published_at = new Date().toISOString();
        }
        const { error } = await supabase
          .from("properties")
          .update(updateData)
          .eq("id", property.id);

        if (error) throw error;

        // Fire-and-forget geocoding to populate lat/lng
        fetch("/api/geocode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId: property.id,
            address: `${streetAddress}, ${city}, ${state} ${zipCode}`,
          }),
        }).catch(() => {});

        // Update comps: delete old, insert new
        await supabase.from("comps").delete().eq("property_id", property.id);
        if (comps.length > 0) {
          const compsToInsert = comps.map((c) => ({
            property_id: property.id,
            address: c.address,
            sale_price: c.sale_price,
            sqft: c.sqft,
            beds: c.beds,
            baths: c.baths,
            date_sold: c.date_sold,
            distance: c.distance,
          }));
          await supabase.from("comps").insert(compsToInsert);
        }
      } else {
        const slug = generateSlug(streetAddress, city);
        const insertData: Record<string, unknown> = { ...propertyData, slug, user_id: user.id };
        if (status === "published") {
          insertData.published_at = new Date().toISOString();
        }
        const { data: newProp, error } = await supabase
          .from("properties")
          .insert(insertData)
          .select()
          .single();

        if (error) throw error;

        // Insert comps
        if (comps.length > 0) {
          const compsToInsert = comps.map((c) => ({
            property_id: newProp.id,
            address: c.address,
            sale_price: c.sale_price,
            sqft: c.sqft,
            beds: c.beds,
            baths: c.baths,
            date_sold: c.date_sold,
            distance: c.distance,
          }));
          await supabase.from("comps").insert(compsToInsert);
        }

        // Fire-and-forget geocoding to populate lat/lng
        fetch("/api/geocode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId: newProp.id,
            address: `${streetAddress}, ${city}, ${state} ${zipCode}`,
          }),
        }).catch(() => {});

        // Move uploaded photos to this property
        if (photos.length > 0) {
          for (const photo of photos) {
            if (photo.id) {
              await supabase
                .from("property_photos")
                .update({ property_id: newProp.id })
                .eq("id", photo.id);
            }
          }
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent";
  const labelClass = "block text-sm font-medium mb-2";

  return (
    <div className="space-y-8 pb-12">
      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Title & Address */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Title & Address</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Property Nickname / Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. The Elm Street Flip" required />
          </div>
          <div>
            <label className={labelClass}>Contract Property Address *</label>
            <input type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} className={inputClass} placeholder="123 Main St" required />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>City *</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Miami" required />
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <select value={state} onChange={(e) => setState(e.target.value)} className={inputClass} required>
                <option value="">Select</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>ZIP *</label>
              <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className={inputClass} placeholder="33101" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Off Market or Listed</label>
              <select value={listingStatus} onChange={(e) => setListingStatus(e.target.value)} className={inputClass}>
                <option value="off_market">Off Market</option>
                <option value="listed">Listed</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Ideal Investors / Strategy</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {INVESTOR_STRATEGIES.map((strategy) => {
                  const isSelected = selectedStrategies.includes(strategy);
                  return (
                    <button
                      key={strategy}
                      type="button"
                      onClick={() =>
                        setSelectedStrategies((prev) =>
                          isSelected ? prev.filter((s) => s !== strategy) : [...prev, strategy]
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                        isSelected
                          ? "bg-primary text-white border-accent"
                          : "bg-muted/50 text-muted-foreground border-border hover:border-accent/50"
                      }`}
                    >
                      {strategy}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Property Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Property Type</label>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={inputClass}>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Beds</label>
              <input type="number" value={beds} onChange={(e) => setBeds(e.target.value)} className={inputClass} placeholder="3" min="0" />
            </div>
            <div>
              <label className={labelClass}>Baths</label>
              <input type="number" value={baths} onChange={(e) => setBaths(e.target.value)} className={inputClass} placeholder="2" min="0" step="0.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Above Grade Sq Ft</label>
              <input type="number" value={sqft} onChange={(e) => setSqft(e.target.value)} className={inputClass} placeholder="1500" min="0" />
            </div>
            <div>
              <label className={labelClass}>Year Built</label>
              <input type="number" value={yearBuilt} onChange={(e) => setYearBuilt(e.target.value)} className={inputClass} placeholder="1985" min="1800" max="2030" />
            </div>
            <div>
              <label className={labelClass}>Lot Size</label>
              <input type="text" value={lotSize} onChange={(e) => setLotSize(e.target.value)} className={inputClass} placeholder="0.25 acres" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Basement Description</label>
            <input type="text" value={basementDescription} onChange={(e) => setBasementDescription(e.target.value)} className={inputClass} placeholder="e.g. Full unfinished, 800 sqft, 7ft ceilings" />
          </div>
          <div>
            <label className={labelClass}>Neighborhood / Location Notes</label>
            <textarea value={neighborhoodNotes} onChange={(e) => setNeighborhoodNotes(e.target.value)} className={`${inputClass} min-h-[80px]`} placeholder="e.g. Quiet street, near schools, values trending up" />
          </div>
          <div>
            <label className={labelClass}>Condition Summary</label>
            <textarea value={conditionSummary} onChange={(e) => setConditionSummary(e.target.value)} className={`${inputClass} min-h-[80px]`} placeholder="e.g. Needs cosmetic updates — roof and HVAC are newer" />
          </div>
          <div>
            <label className={labelClass}>Comps Summary</label>
            <textarea value={compsSummary} onChange={(e) => setCompsSummary(e.target.value)} className={`${inputClass} min-h-[80px]`} placeholder="e.g. 3 comps within 0.5mi sold $240-260K in last 90 days" />
          </div>
        </div>
      </section>

      {/* Financials */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Financials</h2>
        <div className="space-y-6">
          {/* Purchase Price & Legacy Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Purchase Price</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-muted">$</span>
                <input type="number" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} className={`${inputClass} pl-8`} placeholder="150000" min="0" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Assignment Fee</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-muted">$</span>
                <input type="number" value={assignmentFee} onChange={(e) => setAssignmentFee(e.target.value)} className={`${inputClass} pl-8`} placeholder="10000" min="0" />
              </div>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={showAssignmentFee} onChange={(e) => setShowAssignmentFee(e.target.checked)} className="w-4 h-4 rounded border-border text-accent focus:ring-accent bg-background" />
                <span className="text-sm text-muted">Show assignment fee on deal packet</span>
              </label>
            </div>
          </div>

          {/* Light Rehab */}
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Light Rehab Scenario</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Light Rehab Budget (Low)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted">$</span>
                  <input type="number" value={lightRehabBudgetLow} onChange={(e) => setLightRehabBudgetLow(e.target.value)} className={`${inputClass} pl-8`} placeholder="15000" min="0" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Light Rehab Budget (High)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted">$</span>
                  <input type="number" value={lightRehabBudgetHigh} onChange={(e) => setLightRehabBudgetHigh(e.target.value)} className={`${inputClass} pl-8`} placeholder="25000" min="0" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Light Rehab ARV</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted">$</span>
                  <input type="number" value={lightRehabArv} onChange={(e) => setLightRehabArv(e.target.value)} className={`${inputClass} pl-8`} placeholder="230000" min="0" />
                </div>
              </div>
            </div>
          </div>

          {/* Full Rehab */}
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Full Rehab Scenario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Rehab Budget (Low)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted">$</span>
                  <input type="number" value={fullRehabBudgetLow} onChange={(e) => setFullRehabBudgetLow(e.target.value)} className={`${inputClass} pl-8`} placeholder="40000" min="0" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Full Rehab Budget (High)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted">$</span>
                  <input type="number" value={fullRehabBudgetHigh} onChange={(e) => setFullRehabBudgetHigh(e.target.value)} className={`${inputClass} pl-8`} placeholder="60000" min="0" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Full Rehab ARV (Low)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted">$</span>
                  <input type="number" value={fullRehabArvLow} onChange={(e) => setFullRehabArvLow(e.target.value)} className={`${inputClass} pl-8`} placeholder="260000" min="0" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Full Rehab ARV (High)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted">$</span>
                  <input type="number" value={fullRehabArvHigh} onChange={(e) => setFullRehabArvHigh(e.target.value)} className={`${inputClass} pl-8`} placeholder="290000" min="0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rental Projections */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Rental Projections</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Rent After Reno (No Basement Finish)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Low</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted">$</span>
                  <input type="number" value={rentAfterRenoLow} onChange={(e) => setRentAfterRenoLow(e.target.value)} className={`${inputClass} pl-8`} placeholder="1800" min="0" />
                </div>
              </div>
              <div>
                <label className={labelClass}>High</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted">$</span>
                  <input type="number" value={rentAfterRenoHigh} onChange={(e) => setRentAfterRenoHigh(e.target.value)} className={`${inputClass} pl-8`} placeholder="2200" min="0" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Rent After Reno + Finished Basement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Low</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted">$</span>
                  <input type="number" value={rentAfterRenoBasementLow} onChange={(e) => setRentAfterRenoBasementLow(e.target.value)} className={`${inputClass} pl-8`} placeholder="2200" min="0" />
                </div>
              </div>
              <div>
                <label className={labelClass}>High</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted">$</span>
                  <input type="number" value={rentAfterRenoBasementHigh} onChange={(e) => setRentAfterRenoBasementHigh(e.target.value)} className={`${inputClass} pl-8`} placeholder="2600" min="0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deal Analysis (auto-calculated) */}
      {(askingPrice || lightRehabArv || fullRehabArvLow) && (
        <section className="bg-card border border-accent/30 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6">Deal Analysis (Auto-Calculated)</h2>
          <div className="space-y-6">
            {/* Light Rehab Profits */}
            {(lightRehabArv || lightRehabBudgetLow) && (
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Light Rehab Profit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-background rounded-xl">
                    <p className="text-muted text-sm mb-1">Low</p>
                    <p className={`text-2xl font-bold ${analysis.profitLightRehabLow >= 0 ? "text-success" : "text-danger"}`}>
                      {formatCurrency(analysis.profitLightRehabLow)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-xl">
                    <p className="text-muted text-sm mb-1">High</p>
                    <p className={`text-2xl font-bold ${analysis.profitLightRehabHigh >= 0 ? "text-success" : "text-danger"}`}>
                      {formatCurrency(analysis.profitLightRehabHigh)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Full Rehab Profits */}
            {(fullRehabArvLow || fullRehabBudgetLow) && (
              <div>
                <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Full Rehab Profit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-background rounded-xl">
                    <p className="text-muted text-sm mb-1">Low</p>
                    <p className={`text-2xl font-bold ${analysis.profitFullRehabLow >= 0 ? "text-success" : "text-danger"}`}>
                      {formatCurrency(analysis.profitFullRehabLow)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-xl">
                    <p className="text-muted text-sm mb-1">High</p>
                    <p className={`text-2xl font-bold ${analysis.profitFullRehabHigh >= 0 ? "text-success" : "text-danger"}`}>
                      {formatCurrency(analysis.profitFullRehabHigh)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Deal Narrative */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Deal Narrative</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Renovation Overview</label>
            <p className="text-xs text-muted mb-2">Bullet style — one item per line</p>
            <textarea
              value={renovationOverview}
              onChange={(e) => setRenovationOverview(e.target.value)}
              className={`${inputClass} min-h-[120px]`}
              placeholder={"New LVP flooring throughout\nFull kitchen remodel with quartz counters\nUpdated bathrooms\nFresh interior & exterior paint\nNew light fixtures"}
            />
          </div>
          <div>
            <label className={labelClass}>Why This Deal Is Strong</label>
            <p className="text-xs text-muted mb-2">Bullet style — one item per line</p>
            <textarea
              value={whyDealIsStrong}
              onChange={(e) => setWhyDealIsStrong(e.target.value)}
              className={`${inputClass} min-h-[120px]`}
              placeholder={"Below market purchase price\nStrong comps support ARV\nMinimal structural work needed\nHigh-demand rental area\nQuick close possible"}
            />
          </div>
        </div>
      </section>

      {/* Photos */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Photos</h2>
        <PhotoUpload
          propertyId={property?.id}
          existingPhotos={photos}
          onPhotosChange={setPhotos}
        />
      </section>

      {/* Comps */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Comparable Sales</h2>
        <CompsEditor comps={comps} onChange={setComps} />
      </section>

      {/* Showing Instructions & Contact */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Showing Instructions & Contact</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Showing Instructions</label>
            <textarea
              value={showingInstructions}
              onChange={(e) => setShowingInstructions(e.target.value)}
              className={`${inputClass} min-h-[100px]`}
              placeholder="Property is vacant. Lockbox on front door. Code: 1234. Please schedule 24 hours in advance."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Contact Name</label>
              <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass} placeholder="John Doe" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} placeholder="john@example.com" />
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={() => handleSubmit("draft")}
          disabled={loading}
          className="flex items-center gap-2 bg-border hover:bg-border/80 text-foreground px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Draft
        </button>
        <button
          onClick={() => handleSubmit("published")}
          disabled={loading}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Publish Deal Packet
        </button>

        {/* Template buttons (Pro+) */}
        {hasTemplatesAccess && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowTemplatePicker(true)}
              className="flex items-center gap-2 text-sm border border-border hover:border-accent/50 text-muted hover:text-accent px-4 py-2.5 rounded-xl font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              Load Template
            </button>
            <button
              onClick={saveAsTemplate}
              disabled={savingTemplate}
              className="flex items-center gap-2 text-sm border border-border hover:border-accent/50 text-muted hover:text-accent px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {savingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {templateSaved ? "Saved!" : "Save as Template"}
            </button>
          </div>
        )}
      </div>

      {/* Template picker modal */}
      {showTemplatePicker && (
        <ListingTemplatePicker
          onApply={applyTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
}
