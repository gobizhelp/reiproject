import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Home,
  DollarSign,
  TrendingUp,
  Lock,
} from "lucide-react";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Off-Market Listings",
  description:
    "Preview real off-market investment properties. Sign up free to unlock full details, deal analysis, and instant alerts.",
  openGraph: {
    title: "Browse Off-Market Listings",
    description:
      "Preview real off-market investment properties. Sign up free to unlock full details, deal analysis, and instant alerts.",
  },
};

export default async function BrowsePage() {
  const supabase = createAdminClient();
  const { data: listings } = await supabase
    .from("properties")
    .select(
      "id, address, city, state, zip, asking_price, arv, property_type, status, created_at"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(12);

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
          Off-Market Marketplace
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Browse Off-Market Deals
          <br />
          <span className="text-accent">Before They're Gone</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Preview real investment opportunities posted by wholesalers and
          investors. Sign up free to unlock full details, deal analysis, and
          instant alerts.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
        >
          Sign Up to See All Deals <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      <section className="border-y border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            {listings && listings.length > 0
              ? "Latest Off-Market Deals"
              : "Deals Coming Soon"}
          </h2>

          {listings && listings.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden group"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-muted text-sm mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {listing.city}, {listing.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4 text-muted" />
                      <span className="text-sm text-muted capitalize">
                        {listing.property_type || "Residential"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-background border border-border rounded-lg px-3 py-2">
                        <p className="text-xs text-muted">Asking</p>
                        <p className="font-semibold text-success">
                          {listing.asking_price
                            ? `$${listing.asking_price.toLocaleString()}`
                            : "\u2014"}
                        </p>
                      </div>
                      <div className="bg-background border border-border rounded-lg px-3 py-2">
                        <p className="text-xs text-muted">ARV</p>
                        <p className="font-semibold">
                          {listing.arv
                            ? `$${listing.arv.toLocaleString()}`
                            : "\u2014"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-muted text-sm">
                      <Lock className="w-4 h-4" />
                      <span>Sign up to view full details & analysis</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Home className="w-12 h-12 text-border mx-auto mb-4" />
              <p className="text-muted text-lg mb-2">
                New listings are being added daily.
              </p>
              <p className="text-muted">
                Sign up free to be the first to know when deals drop.
              </p>
            </div>
          )}

          {listings && listings.length > 0 && (
            <div className="text-center mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium transition-colors"
              >
                Sign up to browse all listings{" "}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Why Off-Market Deals?
        </h2>
        <p className="text-muted text-lg leading-relaxed mb-4">
          Off-market properties are real estate deals that aren't listed on the
          MLS. They offer investors less competition, better pricing, and faster
          closings. Wholesalers, fix-and-flip investors, and buy-and-hold
          investors use off-market deal flow to build portfolios faster and with
          better returns.
        </p>
        <p className="text-muted text-lg leading-relaxed">
          REI Reach is the marketplace that connects off-market sellers with
          qualified buyers — with full deal analysis, instant matching, and
          professional distribution tools built in.
        </p>
      </section>

      <section className="border-t border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't Let the Next Deal Pass You By
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto mb-8">
            The best off-market deals move fast. Sign up free, set your buy box,
            and get alerts the moment a matching deal drops.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
          >
            Create Your Free Account <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
