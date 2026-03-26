"use client";

import { useState } from "react";
import { Property, PropertyPhoto, Comp, DealAnalysis } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import {
  Building2, Bed, Bath, Maximize, Calendar, MapPin, Phone, Mail, User,
  ChevronLeft, ChevronRight, DollarSign, TrendingUp, Target, Info
} from "lucide-react";

interface Props {
  property: Property;
  photos: PropertyPhoto[];
  comps: Comp[];
  analysis: DealAnalysis;
}

export default function DealPacketView({ property, photos, comps, analysis }: Props) {
  const [currentPhoto, setCurrentPhoto] = useState(0);

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
            <h1 className="text-3xl md:text-4xl font-bold mb-1">{property.street_address}</h1>
            <p className="text-muted text-lg flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {property.city}, {property.state} {property.zip_code}
            </p>
          </div>
        )}

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Asking Price" value={formatCurrency(property.asking_price)} icon={<DollarSign className="w-5 h-5" />} color="text-accent" />
          <MetricCard label="ARV" value={formatCurrency(property.arv)} icon={<TrendingUp className="w-5 h-5" />} color="text-success" />
          <MetricCard label="Repair Estimate" value={formatCurrency(property.repair_estimate)} icon={<Target className="w-5 h-5" />} color="text-orange-400" />
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
                {property.sqft != null && <DetailItem icon={<Maximize className="w-4 h-4" />} label="Sqft" value={property.sqft.toLocaleString()} />}
                {property.year_built != null && <DetailItem icon={<Calendar className="w-4 h-4" />} label="Year Built" value={property.year_built.toString()} />}
                {property.lot_size && <DetailItem icon={<Maximize className="w-4 h-4" />} label="Lot Size" value={property.lot_size} />}
              </div>
            </section>

            {/* Deal Analysis */}
            <section className="bg-card border border-accent/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Deal Analysis</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                  <span className="text-muted">MAO (70% Rule)</span>
                  <span className="text-xl font-bold text-accent">{formatCurrency(analysis.mao)}</span>
                </div>
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
                    ROI = (ARV − Asking − Repairs) / (Asking + Repairs).
                  </p>
                </div>
              </div>
            </section>

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
                  <span className="text-muted">Asking</span>
                  <span className="font-medium">{formatCurrency(property.asking_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">ARV</span>
                  <span className="font-medium">{formatCurrency(property.arv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Repairs</span>
                  <span className="font-medium">{formatCurrency(property.repair_estimate)}</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between">
                  <span className="text-muted">Spread</span>
                  <span className="font-bold text-success">
                    {formatCurrency((property.arv || 0) - (property.asking_price || 0))}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
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
