"use client";

import { useState } from "react";
import { Property, PropertyPhoto, Comp, DealAnalysis } from "@/lib/types";
import { formatCurrency, formatPercent, formatCurrencyRange } from "@/lib/calculations";
import {
  Building2, Bed, Bath, Maximize, Calendar, MapPin, Phone, Mail, User,
  ChevronLeft, ChevronRight, DollarSign, TrendingUp, Target, Info, ArrowRight,
  Tag, Home, Wrench, Star
} from "lucide-react";

interface Props {
  property: Property;
  photos: PropertyPhoto[];
  comps: Comp[];
  analysis: DealAnalysis;
}

export default function DealPacketView({ property, photos, comps, analysis }: Props) {
  const [currentPhoto, setCurrentPhoto] = useState(0);

  const hasLightRehab = property.light_rehab_arv || property.light_rehab_budget_low;
  const hasFullRehab = property.full_rehab_arv_low || property.full_rehab_budget_low;
  const hasRentals = property.rent_after_reno_low || property.rent_after_reno_basement_low;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-accent" />
          <span className="font-bold text-lg">DealPacket</span>
        </div>
      </div>

      {/* Hero - Photo Carousel */}
      {photos.length > 0 && (
        <div className="relative bg-black">
          <div className="max-w-5xl mx-auto">
            <div className="relative aspect-[16/9] md:aspect-[21/9]">
              <img
                src={photos[currentPhoto].url}
                alt={`Property photo ${currentPhoto + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPhoto((p) => (p === 0 ? photos.length - 1 : p - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setCurrentPhoto((p) => (p === photos.length - 1 ? 0 : p + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPhoto(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          i === currentPhoto ? "bg-white" : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Address overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                {property.title && (
                  <p className="text-white/90 text-sm font-medium mb-1 uppercase tracking-wide">{property.title}</p>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {property.street_address}
                </h1>
                <p className="text-white/80 text-lg flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {property.city}, {property.state} {property.zip_code}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Address (if no photos) */}
        {photos.length === 0 && (
          <div className="mb-8">
            {property.title && (
              <p className="text-muted text-sm font-medium mb-1 uppercase tracking-wide">{property.title}</p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-1">{property.street_address}</h1>
            <p className="text-muted text-lg flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {property.city}, {property.state} {property.zip_code}
            </p>
          </div>
        )}

        {/* Tags Bar */}
        {(property.listing_status || property.ideal_investor_strategy) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {property.listing_status && (
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                property.listing_status === "off_market"
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}>
                <Tag className="w-3 h-3" />
                {property.listing_status === "off_market" ? "Off Market" : "Listed"}
              </span>
            )}
            {property.ideal_investor_strategy && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent">
                <Target className="w-3 h-3" />
                {property.ideal_investor_strategy}
              </span>
            )}
          </div>
        )}

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Purchase Price" value={formatCurrency(property.asking_price)} icon={<DollarSign className="w-5 h-5" />} color="text-accent" />
          {property.light_rehab_arv ? (
            <MetricCard label="Light Rehab ARV" value={formatCurrency(property.light_rehab_arv)} icon={<TrendingUp className="w-5 h-5" />} color="text-success" />
          ) : (
            <MetricCard label="ARV" value={formatCurrency(property.arv)} icon={<TrendingUp className="w-5 h-5" />} color="text-success" />
          )}
          {property.light_rehab_budget_low ? (
            <MetricCard label="Light Rehab" value={formatCurrencyRange(property.light_rehab_budget_low, property.light_rehab_budget_high)} icon={<Wrench className="w-5 h-5" />} color="text-orange-400" />
          ) : (
            <MetricCard label="Repair Estimate" value={formatCurrency(property.repair_estimate)} icon={<Target className="w-5 h-5" />} color="text-orange-400" />
          )}
          <MetricCard label="ROI" value={formatPercent(analysis.roi)} icon={<TrendingUp className="w-5 h-5" />} color={analysis.roi >= 0 ? "text-success" : "text-danger"} />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="md:col-span-2 space-y-8">
            {/* Property Details */}
            <section className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Property Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <DetailItem icon={<Building2 className="w-4 h-4" />} label="Type" value={property.property_type} />
                {property.beds != null && <DetailItem icon={<Bed className="w-4 h-4" />} label="Beds" value={property.beds.toString()} />}
                {property.baths != null && <DetailItem icon={<Bath className="w-4 h-4" />} label="Baths" value={property.baths.toString()} />}
                {property.sqft != null && <DetailItem icon={<Maximize className="w-4 h-4" />} label="Above Grade Sqft" value={property.sqft.toLocaleString()} />}
                {property.year_built != null && <DetailItem icon={<Calendar className="w-4 h-4" />} label="Year Built" value={property.year_built.toString()} />}
                {property.lot_size && <DetailItem icon={<Maximize className="w-4 h-4" />} label="Lot Size" value={property.lot_size} />}
              </div>
              {property.basement_description && (
                <div className="mt-4 p-3 bg-background rounded-lg">
                  <p className="text-xs text-muted mb-1">Basement</p>
                  <p className="text-sm">{property.basement_description}</p>
                </div>
              )}
            </section>

            {/* Neighborhood & Condition */}
            {(property.neighborhood_notes || property.condition_summary) && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Property Notes</h2>
                <div className="space-y-4">
                  {property.neighborhood_notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted mb-2">Neighborhood / Location</h3>
                      <p className="text-sm whitespace-pre-wrap">{property.neighborhood_notes}</p>
                    </div>
                  )}
                  {property.condition_summary && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted mb-2">Condition</h3>
                      <p className="text-sm whitespace-pre-wrap">{property.condition_summary}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Deal Analysis */}
            <section className="bg-card border border-accent/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Deal Analysis</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                  <span className="text-muted">MAO (70% Rule)</span>
                  <span className="text-xl font-bold text-accent">{formatCurrency(analysis.mao)}</span>
                </div>

                {/* Light Rehab Profit */}
                {hasLightRehab && (
                  <>
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Light Rehab Scenario</h3>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">Rehab Budget</span>
                      <span className="text-lg font-bold">{formatCurrencyRange(property.light_rehab_budget_low, property.light_rehab_budget_high)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">ARV</span>
                      <span className="text-lg font-bold text-success">{formatCurrency(property.light_rehab_arv)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">Profit Range</span>
                      <span className={`text-lg font-bold ${analysis.profitLightRehabLow >= 0 ? "text-success" : "text-danger"}`}>
                        {formatCurrencyRange(analysis.profitLightRehabLow, analysis.profitLightRehabHigh)}
                      </span>
                    </div>
                  </>
                )}

                {/* Full Rehab Profit */}
                {hasFullRehab && (
                  <>
                    <div className="pt-2">
                      <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Full Rehab Scenario</h3>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">Rehab Budget</span>
                      <span className="text-lg font-bold">{formatCurrencyRange(property.full_rehab_budget_low, property.full_rehab_budget_high)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">ARV</span>
                      <span className="text-lg font-bold text-success">{formatCurrencyRange(property.full_rehab_arv_low, property.full_rehab_arv_high)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">Profit Range</span>
                      <span className={`text-lg font-bold ${analysis.profitFullRehabLow >= 0 ? "text-success" : "text-danger"}`}>
                        {formatCurrencyRange(analysis.profitFullRehabLow, analysis.profitFullRehabHigh)}
                      </span>
                    </div>
                  </>
                )}

                {/* Legacy single-value display (for older deal packets) */}
                {!hasLightRehab && !hasFullRehab && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">Potential Profit</span>
                      <span className={`text-xl font-bold ${analysis.potentialProfit >= 0 ? "text-success" : "text-danger"}`}>
                        {formatCurrency(analysis.potentialProfit)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">ROI</span>
                      <span className={`text-xl font-bold ${analysis.roi >= 0 ? "text-success" : "text-danger"}`}>
                        {formatPercent(analysis.roi)}
                      </span>
                    </div>
                  </>
                )}

                {property.show_assignment_fee && property.assignment_fee != null && (
                  <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                    <span className="text-muted">Assignment Fee</span>
                    <span className="text-xl font-bold">{formatCurrency(property.assignment_fee)}</span>
                  </div>
                )}
                <div className="mt-2 p-3 bg-accent/10 rounded-lg flex items-start gap-2">
                  <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <p className="text-sm text-muted">
                    MAO = ARV × 70% − Repairs{property.show_assignment_fee ? " − Assignment Fee" : ""}.
                    Profit = ARV − Purchase Price − Rehab Budget.
                  </p>
                </div>
              </div>
            </section>

            {/* Rental Projections */}
            {hasRentals && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Rental Projections</h2>
                <div className="space-y-3">
                  {(property.rent_after_reno_low || property.rent_after_reno_high) && (
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">Rent After Reno (No Basement Finish)</span>
                      <span className="text-lg font-bold">{formatCurrencyRange(property.rent_after_reno_low, property.rent_after_reno_high)}/mo</span>
                    </div>
                  )}
                  {(property.rent_after_reno_basement_low || property.rent_after_reno_basement_high) && (
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                      <span className="text-muted">Rent After Reno + Finished Basement</span>
                      <span className="text-lg font-bold">{formatCurrencyRange(property.rent_after_reno_basement_low, property.rent_after_reno_basement_high)}/mo</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Renovation Overview */}
            {property.renovation_overview && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-muted" />
                  Renovation Overview
                </h2>
                <ul className="space-y-2">
                  {property.renovation_overview.split("\n").filter(Boolean).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-accent mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Why This Deal Is Strong */}
            {property.why_deal_is_strong && (
              <section className="bg-card border border-accent/30 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent" />
                  Why This Deal Is Strong
                </h2>
                <ul className="space-y-2">
                  {property.why_deal_is_strong.split("\n").filter(Boolean).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-success mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Comps Summary */}
            {property.comps_summary && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Comps Summary</h2>
                <p className="text-sm whitespace-pre-wrap">{property.comps_summary}</p>
              </section>
            )}

            {/* Photo Gallery */}
            {photos.length > 1 && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.map((photo, i) => (
                    <button
                      key={photo.id}
                      onClick={() => setCurrentPhoto(i)}
                      className="rounded-lg overflow-hidden hover:ring-2 ring-accent transition-all"
                    >
                      <img src={photo.url} alt={`Photo ${i + 1}`} className="w-full h-32 object-cover" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Comps Table */}
            {comps.length > 0 && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Comparable Sales</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-muted">
                        <th className="text-left pb-3 font-medium">Address</th>
                        <th className="text-right pb-3 font-medium">Sale Price</th>
                        <th className="text-right pb-3 font-medium hidden sm:table-cell">Sqft</th>
                        <th className="text-right pb-3 font-medium hidden md:table-cell">Bed/Bath</th>
                        <th className="text-right pb-3 font-medium hidden sm:table-cell">Date Sold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comps.map((comp) => (
                        <tr key={comp.id} className="border-b border-border/50">
                          <td className="py-3">{comp.address}</td>
                          <td className="py-3 text-right font-medium">{formatCurrency(comp.sale_price)}</td>
                          <td className="py-3 text-right text-muted hidden sm:table-cell">{comp.sqft?.toLocaleString()}</td>
                          <td className="py-3 text-right text-muted hidden md:table-cell">
                            {comp.beds}/{comp.baths}
                          </td>
                          <td className="py-3 text-right text-muted hidden sm:table-cell">
                            {comp.date_sold ? new Date(comp.date_sold).toLocaleDateString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* Right column - Contact & Showing */}
          <div className="space-y-6">
            {/* Contact Info */}
            {(property.contact_name || property.contact_phone || property.contact_email) && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Contact</h2>
                <div className="space-y-3">
                  {property.contact_name && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted" />
                      <span>{property.contact_name}</span>
                    </div>
                  )}
                  {property.contact_phone && (
                    <a href={`tel:${property.contact_phone}`} className="flex items-center gap-3 text-accent hover:underline">
                      <Phone className="w-4 h-4" />
                      <span>{property.contact_phone}</span>
                    </a>
                  )}
                  {property.contact_email && (
                    <a href={`mailto:${property.contact_email}`} className="flex items-center gap-3 text-accent hover:underline">
                      <Mail className="w-4 h-4" />
                      <span>{property.contact_email}</span>
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Showing Instructions */}
            {property.showing_instructions && (
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Showing Instructions</h2>
                <p className="text-muted whitespace-pre-wrap">{property.showing_instructions}</p>
              </section>
            )}

            {/* Quick Summary */}
            <section className="bg-accent/10 border border-accent/30 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Quick Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Purchase Price</span>
                  <span className="font-medium">{formatCurrency(property.asking_price)}</span>
                </div>
                {hasLightRehab && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted">Light Rehab</span>
                      <span className="font-medium">{formatCurrencyRange(property.light_rehab_budget_low, property.light_rehab_budget_high)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Light ARV</span>
                      <span className="font-medium">{formatCurrency(property.light_rehab_arv)}</span>
                    </div>
                  </>
                )}
                {hasFullRehab && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted">Full Rehab</span>
                      <span className="font-medium">{formatCurrencyRange(property.full_rehab_budget_low, property.full_rehab_budget_high)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Full ARV</span>
                      <span className="font-medium">{formatCurrencyRange(property.full_rehab_arv_low, property.full_rehab_arv_high)}</span>
                    </div>
                  </>
                )}
                {!hasLightRehab && !hasFullRehab && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted">ARV</span>
                      <span className="font-medium">{formatCurrency(property.arv)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Repairs</span>
                      <span className="font-medium">{formatCurrency(property.repair_estimate)}</span>
                    </div>
                  </>
                )}
                <hr className="border-border" />
                <div className="flex justify-between">
                  <span className="text-muted">Spread</span>
                  <span className="font-bold text-success">
                    {hasLightRehab
                      ? formatCurrency((property.light_rehab_arv || 0) - (property.asking_price || 0))
                      : formatCurrency((property.arv || 0) - (property.asking_price || 0))
                    }
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Sign Up CTA */}
        <section className="mt-12 bg-accent/10 border border-accent/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">
            Want to see more {property.contact_name ? `from ${property.contact_name}` : "properties like this"}?
          </h2>
          <p className="text-muted mb-6 max-w-lg mx-auto">
            Sign up for free to browse more off-market deals and connect with wholesalers on DealPacket.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Sign up here
            <ArrowRight className="w-4 h-4" />
          </a>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className={`flex items-center gap-2 mb-1 ${color}`}>
        {icon}
        <span className="text-xs font-medium text-muted">{label}</span>
      </div>
      <p className={`text-xl md:text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
      <div className="text-muted">{icon}</div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
