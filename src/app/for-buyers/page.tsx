import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";
import HeroSection from "@/components/marketing/hero-section";
import FeatureCard from "@/components/marketing/feature-card";
import CTASection from "@/components/marketing/cta-section";
import { Target, Bell, Shield, Clock, BarChart3, Heart, Search, Zap, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "For Buyers",
  description: "Find off-market deals before anyone else. Set your buy box, get instant alerts, and invest with confidence using full deal analysis on every listing.",
  openGraph: {
    title: "For Buyers",
    description: "Find off-market deals before anyone else. Set your buy box, get instant alerts, and invest with confidence using full deal analysis on every listing.",
  },
};

export default function ForBuyersPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <HeroSection
        eyebrow="For Cash Buyers & Investors"
        title="Find Off-Market Deals"
        titleAccent="Before Anyone Else"
        subtitle="Set your buy box once. Get matched deals delivered to your inbox — with full analysis included. No more wasting hours on deals that don't fit your criteria."
        primaryCTA={{ label: "Set Up Your Buy Box Free", href: "/signup" }}
        secondaryCTA={{ label: "Browse Listings", href: "/browse" }}
      />

      {/* Pain Points Section */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Sound Familiar?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-danger" />
              </div>
              <h3 className="font-semibold mb-2">Missing Great Deals</h3>
              <p className="text-muted text-sm">By the time you hear about an off-market deal through your network, someone else has already locked it up. Speed wins in this market.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-danger" />
              </div>
              <h3 className="font-semibold mb-2">Wasting Time on Bad Leads</h3>
              <p className="text-muted text-sm">Sifting through deals that don&apos;t match your criteria is exhausting. Every hour wasted on a bad lead is an hour you&apos;re not closing a good one.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-danger" />
              </div>
              <h3 className="font-semibold mb-2">Scattered Deal Tracking</h3>
              <p className="text-muted text-sm">Spreadsheets, notes apps, and text threads. Your deal pipeline deserves better than duct-tape organization.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Invest Smarter. Move Faster. Win More.</h2>
          <p className="text-muted max-w-2xl mx-auto">Tools that give you the edge you need to build a portfolio your family will thank you for.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Target}
            iconColor="text-accent"
            title="Smart Buy Boxes"
            description="Define your ideal deal once — location, price range, property type, strategy — and the platform does the searching for you. Set it and forget it."
          />
          <FeatureCard
            icon={Bell}
            iconColor="text-success"
            title="Instant Alerts"
            description="Get email and SMS notifications the moment a matching deal drops. While others are still browsing, you're already making an offer."
          />
          <FeatureCard
            icon={Shield}
            iconColor="text-accent"
            title="Full Deal Analysis"
            description="Every listing comes with auto-calculated MAO, ROI, profit projections, and comps. Invest with confidence — never overpay again."
          />
          <FeatureCard
            icon={Zap}
            iconColor="text-amber-400"
            title="First-Look Access"
            description="Elite buyers get exclusive early access to new listings before anyone else. In real estate, being first isn't an advantage — it's everything."
          />
          <FeatureCard
            icon={BarChart3}
            iconColor="text-accent"
            title="Deal Pipeline"
            description="Track every deal through stages — from saved to reviewing to contacted to closed. Your acquisition pipeline, organized and visible."
          />
          <FeatureCard
            icon={Heart}
            iconColor="text-success"
            title="Save & Filter"
            description="Save your favorite listings, add private notes, and use advanced filters to surface exactly what you're looking for. Your time is too valuable to waste."
          />
        </div>
      </section>

      <CTASection
        title="The Best Deals Don't Wait"
        subtitle="While you're reading this, investors on REI Reach are getting matched to off-market deals. Set up your buy box in 60 seconds — it's free."
        ctaLabel="Set Up Your Buy Box Free"
        ctaHref="/signup"
      />

      <Footer />
    </div>
  );
}
