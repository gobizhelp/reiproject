import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";
import HeroSection from "@/components/marketing/hero-section";
import FeatureCard from "@/components/marketing/feature-card";
import CTASection from "@/components/marketing/cta-section";
import {
  Target, Bell, Shield, BarChart3, Share2, Users, Upload, Mail, Zap,
  Heart, Search, Filter, Clock, Lock, MessageCircle, Eye, Smartphone, Crown
} from "lucide-react";

export const metadata: Metadata = {
  title: "Features",
  description: "Explore every tool REI Reach offers — buy boxes, instant matching, deal analysis, analytics, team features, and more. Built for serious real estate investors.",
  openGraph: {
    title: "Features",
    description: "Explore every tool REI Reach offers — buy boxes, instant matching, deal analysis, analytics, team features, and more. Built for serious real estate investors.",
  },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <HeroSection
        eyebrow="Platform Features"
        title="Every Tool You Need"
        titleAccent="To Close More Deals"
        subtitle="Built for serious investors who want an unfair advantage. From deal analysis to buyer matching to distribution — everything in one platform."
        primaryCTA={{ label: "Get Started Free", href: "/signup" }}
      />

      {/* Buyer Tools */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Buyer Tools</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Find the Right Deals, Faster</h2>
          <p className="text-muted max-w-2xl mx-auto">Stop wasting time on deals that don&apos;t fit. These tools ensure every opportunity you see matches your investment criteria.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={Target}
            title="Smart Buy Boxes"
            description="Define your ideal deal criteria — location, price range, property type, strategy. The platform matches deals to you automatically."
          />
          <FeatureCard
            icon={Bell}
            iconColor="text-success"
            title="Instant Alerts"
            description="Email and SMS notifications the moment a matching deal is posted. Be the first to know, the first to act."
          />
          <FeatureCard
            icon={Shield}
            title="Full Deal Analysis"
            description="Auto-calculated MAO, ROI, profit projections, and comparable sales on every listing. Invest with confidence, not hope."
          />
          <FeatureCard
            icon={Filter}
            iconColor="text-amber-400"
            title="Advanced Filters"
            description="Filter by price, location, property type, beds, baths, square footage, and more. Surface exactly what you need."
          />
          <FeatureCard
            icon={Heart}
            title="Save & Organize"
            description="Save listings, add private notes, and track deals through your personal pipeline. Stay organized as you scale."
          />
          <FeatureCard
            icon={Crown}
            iconColor="text-amber-400"
            title="First-Look Access"
            description="Elite buyers see new listings before anyone else. In a competitive market, being first is everything."
          />
        </div>
      </section>

      {/* Seller Tools */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Seller Tools</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Move Properties Faster Than Ever</h2>
            <p className="text-muted max-w-2xl mx-auto">Professional tools that make your deals look credible and reach the right buyers — so you close faster and earn more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Upload}
              title="Professional Listings"
              description="Create polished deal listings with photos, property details, and comps. Look professional because your deals are professional."
            />
            <FeatureCard
              icon={BarChart3}
              iconColor="text-success"
              title="Auto Deal Analysis"
              description="MAO, ROI, and profit projections calculated automatically from your property data. Buyers trust numbers — give them great ones."
            />
            <FeatureCard
              icon={Share2}
              title="1-Click Sharing"
              description="Generate shareable deal packet links instantly. Send them to your network, post them anywhere — complete with full analysis."
            />
            <FeatureCard
              icon={Mail}
              iconColor="text-amber-400"
              title="SMS Blasts"
              description="Send SMS alerts to matched buyers with one click. Matched buyers also receive automatic email notifications when new deals fit their buy boxes."
            />
            <FeatureCard
              icon={Users}
              title="Buyer Directory"
              description="See who's interested in your deals. Track inquiries, manage buyer relationships, and build your network."
            />
            <FeatureCard
              icon={Eye}
              iconColor="text-amber-400"
              title="Listing Analytics"
              description="Track views, saves, and inquiries for every listing. Know which deals are hot and optimize your strategy."
            />
          </div>
        </div>
      </section>

      {/* Matching & Alerts */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Matching & Alerts</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Right Deal Meets the Right Buyer</h2>
          <p className="text-muted max-w-2xl mx-auto">Our matching engine connects deals to buyers in real time — so no opportunity is missed.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureCard
            icon={Zap}
            title="Algorithm Matching"
            description="Every listing is scored against every active buy box. When there's a fit, both sides know instantly."
          />
          <FeatureCard
            icon={Mail}
            iconColor="text-success"
            title="Email Alerts"
            description="Automatic email notifications for matching deals. Daily digests for free users, instant alerts for Pro and Elite."
          />
          <FeatureCard
            icon={Smartphone}
            iconColor="text-amber-400"
            title="SMS Alerts"
            description="Real-time text message alerts for Elite buyers. Because the best deals don't wait for you to check your email."
          />
          <FeatureCard
            icon={Lock}
            title="First-Look Windows"
            description="Elite buyers get exclusive early access before deals go live to all users. A 24-hour head start can make or break a deal."
          />
        </div>
      </section>

      {/* Analytics & Team */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">Analytics & Team</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Scale With Confidence</h2>
            <p className="text-muted max-w-2xl mx-auto">Track performance, collaborate with your team, and grow your operation without losing control.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon={BarChart3}
              title="Performance Analytics"
              description="Track listing views, saves, inquiries, and conversion metrics. Data-driven decisions lead to bigger returns."
            />
            <FeatureCard
              icon={MessageCircle}
              iconColor="text-success"
              title="Built-in Messaging"
              description="Communicate directly with buyers and sellers through the platform. No more chasing phone numbers or lost email threads."
            />
            <FeatureCard
              icon={Users}
              iconColor="text-amber-400"
              title="Team Seats"
              description="Invite team members, share pipelines, and collaborate on deals. Scale your operation without the chaos."
            />
            <FeatureCard
              icon={Clock}
              title="Deal Pipeline"
              description="Track every deal from first look to closing. Stages, notes, and status updates keep your acquisitions organized."
            />
          </div>
        </div>
      </section>

      <CTASection
        title="Ready for an Unfair Advantage?"
        subtitle="Every feature is built to help you close more deals and build real wealth. Start free — upgrade when you're ready."
        ctaLabel="Get Started Free"
        ctaHref="/signup"
      />

      <Footer />
    </div>
  );
}
