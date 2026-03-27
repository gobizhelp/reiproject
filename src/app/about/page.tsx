import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";
import HeroSection from "@/components/marketing/hero-section";
import FeatureCard from "@/components/marketing/feature-card";
import CTASection from "@/components/marketing/cta-section";
import { Zap, Eye, Layers, Building2, DollarSign, Home, TrendingUp, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "REI Reach is built by investors, for investors. Learn why we created the off-market real estate marketplace designed to help you close more deals and build generational wealth.",
  openGraph: {
    title: "About",
    description:
      "REI Reach is built by investors, for investors. Learn why we created the off-market real estate marketplace designed to help you close more deals and build generational wealth.",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <HeroSection
        eyebrow="Our Story"
        title="Built By Investors,"
        titleAccent="For Investors"
        subtitle="We built REI Reach because we were tired of the same broken process — scattered buyer lists, unprofessional deal packets, and deals that should have closed but didn't. There had to be a better way."
        primaryCTA={{ label: "Join the Community", href: "/signup" }}
      />

      {/* The Problem */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Off-Market Deal Flow Is Broken</h2>
          <p className="text-muted text-lg leading-relaxed mb-4">
            Wholesalers blast deals to unqualified buyers and hope for the best. Investors miss opportunities because they&apos;re buried in irrelevant listings. Everyone wastes time on manual processes that should have been automated years ago.
          </p>
          <p className="text-muted text-lg leading-relaxed">
            The result? Deals fall through. Money is left on the table. And the people who should be building wealth for their families are stuck in a cycle of inefficiency.
          </p>
        </div>
      </section>

      {/* The Vision */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">A Better Way to Do Deals</h2>
        <p className="text-muted text-lg leading-relaxed mb-4">
          REI Reach is the infrastructure layer for off-market real estate. We connect wholesalers with qualified buyers through intelligent matching, professional deal presentation, and instant distribution.
        </p>
        <p className="text-muted text-lg leading-relaxed">
          Our mission is simple: help every investor — whether you&apos;re closing your first deal or your hundredth — move faster, earn more, and build the financial future your family deserves.
        </p>
      </section>

      {/* Who It's For */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Built For</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: DollarSign, label: "Wholesalers" },
              { icon: Home, label: "Buy & Hold Investors" },
              { icon: TrendingUp, label: "Fix & Flippers" },
              { icon: Building2, label: "Institutional Buyers" },
              { icon: Users, label: "Agents with Off-Market Deals" },
            ].map((item) => (
              <div key={item.label} className="bg-card border border-border rounded-xl p-6 text-center">
                <item.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="font-medium text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Zap}
            iconColor="text-amber-400"
            title="Speed"
            description="Deals don't wait. Every feature is designed to help you move faster — from listing to closing."
          />
          <FeatureCard
            icon={Eye}
            iconColor="text-accent"
            title="Transparency"
            description="Full deal analysis on every listing. No hidden numbers, no guesswork. Just data you can trust."
          />
          <FeatureCard
            icon={Layers}
            iconColor="text-success"
            title="Simplicity"
            description="One platform for everything. No more juggling spreadsheets, email chains, and disconnected tools."
          />
        </div>
      </section>

      <CTASection
        title="Join a Community That Closes"
        subtitle="Whether you're a wholesaler moving 50 deals a year or an investor looking for your next buy, you belong here."
        ctaLabel="Create Your Free Account"
        ctaHref="/signup"
      />

      <Footer />
    </div>
  );
}
