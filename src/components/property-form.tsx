"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Property, Comp } from "@/lib/types";
import { calculateDealAnalysis, formatCurrency, formatPercent } from "@/lib/calculations";
import PhotoUpload from "./photo-upload";
import CompsEditor from "./comps-editor";
import { Loader2, Save, Send } from "lucide-react";

interface Props {
  property?: Property & { property_photos: any[]; comps: Comp[] };
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
];

const PROPERTY_TYPES = [
  "Single Family", "Multi Family", "Townhouse", "Condo", "Duplex",
  "Triplex", "Fourplex", "Mobile Home", "Land", "Commercial", "Other"
];

export default function PropertyForm({ property }: Props) {
  const router = useRouter();
  const isEditing = !!property;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [streetAddress, setStreetAddress] = useState(property?.street_address || "");
  const [city, setCity] = useState(property?.city || "");
  const [state, setState] = useState(property?.state || "");
  const [zipCode, setZipCode] = useState(property?.zip_code || "");
  const [propertyType, setPropertyType] = useState(property?.property_type || "Single Family");
  const [beds, setBeds] = useState(property?.beds?.toString() || "");
  const [baths, setBaths] = useState(property?.baths?.toString() || "");
  const [sqft, setSqft] = useState(property?.sqft?.toString() || "");
  const [yearBuilt, setYearBuilt] = useState(property?.year_built?.toString() || "");
  const [lotSize, setLotSize] = useState(property?.lot_size || "");

  const [askingPrice, setAskingPrice] = useState(property?.asking_price?.toString() || "");
  const [arv, setArv] = useState(property?.arv?.toString() || "");
  const [repairEstimate, setRepairEstimate] = useState(property?.repair_estimate?.toString() || "");
  const [assignmentFee, setAssignmentFee] = useState(property?.assignment_fee?.toString() || "");
  const [showAssignmentFee, setShowAssignmentFee] = useState(property?.show_assignment_fee ?? false);

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
    parseFloat(assignmentFee) || null
  );

  function generateSlug(address: string, city: string): string {
    return `${address}-${city}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) + "-" + Math.random().toString(36).slice(2, 8);
  }

  async function handleSubmit(status: "draft" | "published") {
    if (!streetAddress || !city || !state || !zipCode) {
      setError("Please fill in the property address fields.");
      return;
    }

    setLoading(true);
    setError("");

    const propertyData = {
      street_address: streetAddress,
      city,
      state,
      zip_code: zipCode,
      property_type: propertyType,
      beds: beds ? parseInt(beds) : null,
      baths: baths ? parseFloat(baths) : null,
      sqft: sqft ? parseInt(sqft) : null,
      year_built: yearBuilt ? parseInt(yearBuilt) : null,
      lot_size: lotSize || null,
      asking_price: askingPrice ? parseFloat(askingPrice) : null,
      arv: arv ? parseFloat(arv) : null,
      repair_estimate: repairEstimate ? parseFloat(repairEstimate) : null,
      assignment_fee: assignmentFee ? parseFloat(assignmentFee) : null,
      show_assignment_fee: showAssignmentFee,
      showing_instructions: showingInstructions || null,
      contact_name: contactName || null,
      contact_phone: contactPhone || null,
      contact_email: contactEmail || null,
      status,
    };

    const supabase = createClient();

    try {
      if (isEditing) {
        const { error } = await supabase
          .from("properties")
          .update({ ...propertyData, updated_at: new Date().toISOString() })
          .eq("id", property.id);

        if (error) throw error;

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
        const { data: newProp, error } = await supabase
          .from("properties")
          .insert({ ...propertyData, slug })
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

      {/* Address & Details */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Property Address & Details</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Street Address *</label>
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
              <label className={labelClass}>Sqft</label>
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
        </div>
      </section>

      {/* Financials */}
      <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">Financials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Asking Price</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-muted">$</span>
              <input type="number" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} className={`${inputClass} pl-8`} placeholder="150000" min="0" />
            </div>
          </div>
          <div>
            <label className={labelClass}>ARV (After Repair Value)</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-muted">$</span>
              <input type="number" value={arv} onChange={(e) => setArv(e.target.value)} className={`${inputClass} pl-8`} placeholder="250000" min="0" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Repair Estimate</label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-muted">$</span>
              <input type="number" value={repairEstimate} onChange={(e) => setRepairEstimate(e.target.value)} className={`${inputClass} pl-8`} placeholder="35000" min="0" />
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
      </section>

      {/* Deal Analysis (auto-calculated) */}
      {(arv || askingPrice) && (
        <section className="bg-card border border-accent/30 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold mb-6">Deal Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-background rounded-xl">
              <p className="text-muted text-sm mb-1">MAO (70% Rule)</p>
              <p className="text-2xl font-bold text-accent">{formatCurrency(analysis.mao)}</p>
            </div>
            <div className="text-center p-4 bg-background rounded-xl">
              <p className="text-muted text-sm mb-1">Potential Profit</p>
              <p className={`text-2xl font-bold ${analysis.potentialProfit >= 0 ? "text-success" : "text-danger"}`}>
                {formatCurrency(analysis.potentialProfit)}
              </p>
            </div>
            <div className="text-center p-4 bg-background rounded-xl">
              <p className="text-muted text-sm mb-1">ROI</p>
              <p className={`text-2xl font-bold ${analysis.roi >= 0 ? "text-success" : "text-danger"}`}>
                {formatPercent(analysis.roi)}
              </p>
            </div>
          </div>
        </section>
      )}

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
      <div className="flex items-center gap-4">
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
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Publish Deal Packet
        </button>
      </div>
    </div>
  );
}
