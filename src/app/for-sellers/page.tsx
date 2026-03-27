import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";
import HeroSection from "@/components/marketing/hero-section";
import FeatureCard from "@/components/marketing/feature-card";
import StepCard from "@/components/marketing/step-card";
import CTASection from "@/components/marketing/cta-section";
import { DollarSign, Target, Mail, BarChart3, Share2, Users, Upload, Zap, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "For Sellers | REI Reach",
  description: "Move properties faster, earn bigger assignment fees, and reach qualified buyers instantly. The dispo system built for wholesalers who refuse to leave money on the table.",
};

export default function ForSellersPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <HeroSection
        eyebrow="For Wholesalers, Investors & Agents"
        title="Stop Chasing Buyers."
        titleAccent="Start Attracting Them."
        subtitle="The dispo system built for wholesalers who refuse to leave money on the table. Create professional deal packets, reach matched buyers instantly, and close in days — not weeks."
        primaryCTA={{ label: "List Your First Deal Free", href: "/signup" }}
        secondaryCTA={{ label: "See How It Works", href: "/how-it-works" }}
      />

      {/* Pain Points Section */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Sound Familiar?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-danger" />
              </div>
              <h3 className="font-semibold mb-2">Scattered Buyer Lists</h3>
              <p className="text-muted text-sm">Spreadsheets, text threads, and outdated contacts. You&apos;re spending more time organizing buyers than closing deals.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-6 h-6 text-danger" />
              </div>
              <h3 className="font-semibold mb-2">Unprofessional Deal Packets</h3>
              <p className="text-muted text-sm">Blurry photos and missing numbers kill buyer confidence. If your deal packet doesn&apos;t look credible, buyers move on.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-danger" />
              </div>
              <h3 className="font-semibold mb-2">Slow Closings</h3>
              <p className="text-muted text-sm">Every day a deal sits is a day you risk losing it. Manual follow-ups and scattered communication drain your time and your margins.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Everything You Need to Move Deals Faster</h2>
          <p className="text-muted max-w-2xl mx-auto">Tools designed to help you earn bigger fees and provide for the people who matter most.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Upload}
            iconColor="text-accent"
            title="Professional Listings"
            description="Upload photos, add comps, and get auto-generated deal analysis with MAO, ROI, and profit projections. Your deals look credible because they are."
          />
          <FeatureCard
            icon={Target}
            iconColor="text-success"
            title="Instant Buyer Matching"
            description="Every listing is automatically matched to buyers whose buy boxes fit your deal. No more blasting and hoping — reach the right people, every time."
          />
          <FeatureCard
            icon={Mail}
            iconColor="text-amber-400"
            title="Email & SMS Blasts"
            description="Distribute deals to your matched buyers with one click. Email blasts, SMS alerts, and shareable links get your deal in front of buyers before the competition."
          />
          <FeatureCard
            icon={BarChart3}
            iconColor="text-accent"
            title="Listing Analytics"
            description="Track views, saves, and inquiries for every listing. Know exactly which deals are generating interest and optimize your strategy."
          />
          <FeatureCard
            icon={Share2}
            iconColor="text-success"
            title="1-Click Deal Sharing"
            description="Generate professional, shareable deal packet links. Send them to your network, post them anywhere — buyers get a complete picture in seconds."
          />
          <FeatureCard
            icon={Users}
            iconColor="text-amber-400"
            title="Team & Branded Pages"
            description="Scale your operation with team seats, shared pipelines, and branded profiles. Build the business that gives your family the life they deserve."
          />
        </div>
      </section>

      {/* How Sellers Use REI Reach */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">How Sellers Use REI Reach</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <StepCard
            step={1}
            icon={Upload}
            title="Create Your Listing"
            description="Add property details, photos, and comps. Our platform auto-calculates deal analysis so every buyer sees the full picture."
          />
          <StepCard
            step={2}
            icon={Zap}
            title="Reach Matched Buyers"
            description="Your listing is instantly matched to buyers looking for exactly what you have. Blast it out via email and SMS in one click."
          />
          <StepCard
            step={3}
            icon={DollarSign}
            iconColor="text-success"
            title="Close & Earn"
            description="Receive inquiries, negotiate through built-in messaging, and close faster than you ever thought possible."
          />
        </div>
      </section>

      <CTASection
        title="Your Deals Deserve Better Distribution"
        subtitle="Stop leaving assignment fees on the table. List your first deal for free and see how fast the right buyers find you."
        ctaLabel="List Your First Deal Free"
        ctaHref="/signup"
      />

      <Footer />
    </div>
  );
}
