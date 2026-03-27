import type { Metadata } from "next";
import { Upload, Target, Zap, Send } from "lucide-react";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";
import HeroSection from "@/components/marketing/hero-section";
import StepCard from "@/components/marketing/step-card";
import CTASection from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "See how REI Reach connects wholesalers with qualified buyers through deal posting, buy box matching, instant alerts, and streamlined distribution.",
  openGraph: {
    title: "How It Works",
    description:
      "See how REI Reach connects wholesalers with qualified buyers through deal posting, buy box matching, instant alerts, and streamlined distribution.",
  },
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <HeroSection
        eyebrow="Simple. Fast. Powerful."
        title="From Listing to Closing"
        titleAccent="In 4 Simple Steps"
        subtitle="The system top wholesalers use to move deals faster than the competition. No more guessing, no more chasing — just qualified buyers matched to your deals, instantly."
        primaryCTA={{ label: "Get Started Free", href: "/signup" }}
        secondaryCTA={{ label: "View Features", href: "/features" }}
      />

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <StepCard
            step={1}
            icon={Upload}
            title="Sellers Post Deals"
            description="Create a professional listing in minutes. Upload photos, add comps, and let our platform auto-generate deal analysis with MAO, ROI, and profit projections — so buyers see exactly why your deal is worth their money."
          />
          <StepCard
            step={2}
            icon={Target}
            title="Buyers Set Buy Boxes"
            description="Define your ideal deal criteria once — location, price range, property type, investment strategy — and the platform remembers. No more manually sifting through deals that don't fit your portfolio."
          />
          <StepCard
            step={3}
            icon={Zap}
            title="Platform Matches & Alerts"
            description="Our matching algorithm connects every new listing to the right buyers in real time. Instant email and SMS alerts mean you never miss a deal that fits — while your competitors are still refreshing their inbox."
          />
          <StepCard
            step={4}
            icon={Send}
            title="Inquiries & Distribution"
            description="Buyers inquire with one click. Sellers distribute via email blasts, messaging, and shareable deal packet links. The back-and-forth that kills deals? Eliminated."
          />
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">The Result?</h2>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          Deals close faster. Sellers earn bigger assignment fees. Buyers find
          properties that actually match their criteria. Everyone wins — except
          your competition.
        </p>
      </div>

      <CTASection
        title="Your Next Deal Is One Step Away"
        subtitle="Join the wholesalers and investors who are already closing faster and building generational wealth. It's free to get started."
        ctaLabel="Start Closing Deals"
        ctaHref="/signup"
      />

      <Footer />
    </div>
  );
}
