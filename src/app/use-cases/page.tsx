import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";
import HeroSection from "@/components/marketing/hero-section";
import CTASection from "@/components/marketing/cta-section";
import { DollarSign, Home, TrendingUp, Building2, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Use Cases",
  description:
    "See how wholesalers, fix-and-flip investors, buy-and-hold investors, institutional buyers, and agents use REI Reach to close more deals.",
  openGraph: {
    title: "Use Cases",
    description:
      "See how wholesalers, fix-and-flip investors, buy-and-hold investors, institutional buyers, and agents use REI Reach to close more deals.",
  },
};

const useCases = [
  {
    icon: DollarSign,
    title: "Wholesalers",
    description:
      "You find off-market deals and assign them to end buyers. Speed and buyer access are everything. REI Reach puts your deals in front of qualified, ready-to-close buyers — instantly.",
    features: [
      "Post deals with professional deal packets in minutes",
      "Auto-match to buyers whose buy boxes fit your deal",
      "Blast to your buyer list via email and SMS",
      "Track inquiries and close faster with built-in messaging",
    ],
    highlightTitle: "How Wholesalers Win on REI Reach",
    highlights: [
      {
        label: "Professional Deal Packets",
        detail: "Auto-generated MAO, ROI, and comps make buyers confident",
      },
      {
        label: "Instant Distribution",
        detail: "Matched buyers are notified automatically when new deals fit their criteria",
      },
      {
        label: "Faster Closings",
        detail: "Built-in messaging eliminates the back-and-forth",
      },
    ],
    alt: false,
  },
  {
    icon: Home,
    title: "Buy & Hold Investors",
    description:
      "You're building a rental portfolio for long-term wealth. Every property needs to meet specific cash-flow criteria. REI Reach delivers deals that match your numbers — so you spend less time searching and more time acquiring.",
    features: [
      "Set buy box criteria for your target cash-flow properties",
      "Get instant alerts when matching deals are posted",
      "Full deal analysis with rental projections on every listing",
      "Track deals through your personal acquisition pipeline",
    ],
    highlightTitle: "How Buy & Hold Investors Win",
    highlights: [
      {
        label: "Targeted Buy Boxes",
        detail:
          "Filter by location, price, property type, and rental potential",
      },
      {
        label: "Deal Analysis Built In",
        detail: "ROI and cash-flow projections on every listing",
      },
      {
        label: "Pipeline Tracking",
        detail: "Manage acquisitions from first look to closing",
      },
    ],
    alt: true,
  },
  {
    icon: TrendingUp,
    title: "Fix & Flip Investors",
    description:
      "Margins are everything in fix-and-flip. You need deals with enough spread to cover rehab costs and still profit. REI Reach shows you the numbers upfront — so you never overpay for a flip.",
    features: [
      "Filter by ARV, rehab estimates, and profit potential",
      "Compare comps to validate your offer price",
      "First-look access to new listings (Elite)",
      "Save and organize deals by project stage",
    ],
    highlightTitle: "How Flippers Win",
    highlights: [
      {
        label: "ARV & Rehab Analysis",
        detail: "See profit potential before you make an offer",
      },
      {
        label: "First-Look Advantage",
        detail: "Elite flippers see deals before the competition",
      },
      {
        label: "Speed to Close",
        detail: "Contact sellers instantly through the platform",
      },
    ],
    alt: false,
  },
  {
    icon: Building2,
    title: "Institutional & Hedge Fund Buyers",
    description:
      "You're acquiring at scale. Your team needs a consistent pipeline of deals that meet strict criteria. REI Reach provides the volume, the data, and the team tools to streamline bulk acquisitions.",
    features: [
      "Set multiple buy boxes across markets",
      "Team seats with shared deal pipelines",
      "First-look access to new inventory before retail buyers",
      "Bulk export capabilities for portfolio analysis",
    ],
    highlightTitle: "How Institutional Buyers Win",
    highlights: [
      {
        label: "Multi-Market Coverage",
        detail: "Set buy boxes in every market you operate in",
      },
      {
        label: "Team Collaboration",
        detail: "Shared pipelines and notes keep everyone aligned",
      },
      {
        label: "Volume Advantage",
        detail: "Constant deal flow matched to your exact criteria",
      },
    ],
    alt: true,
  },
  {
    icon: Users,
    title: "Agents with Off-Market Inventory",
    description:
      "You've got pocket listings and off-market properties, but no efficient way to reach the right investors. REI Reach connects your inventory to a marketplace full of qualified, ready-to-buy investors.",
    features: [
      "List off-market properties with professional presentation",
      "Reach verified investors actively looking in your market",
      "Branded seller profile and deal pages",
      "Analytics to track interest and optimize outreach",
    ],
    highlightTitle: "How Agents Win",
    highlights: [
      {
        label: "Investor Marketplace",
        detail: "Reach buyers your MLS listing never would",
      },
      {
        label: "Professional Branding",
        detail: "Branded pages build trust and credibility",
      },
      {
        label: "Track Performance",
        detail: "See which listings generate the most interest",
      },
    ],
    alt: false,
  },
];

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <HeroSection
        eyebrow="Use Cases"
        title="Built for Every"
        titleAccent="Real Estate Strategy"
        subtitle="Whether you wholesale, flip, or hold — REI Reach gives you the tools and connections to close more deals and build real wealth."
        primaryCTA={{ label: "Find Your Edge", href: "/signup" }}
      />

      {useCases.map((uc) => {
        const Icon = uc.icon;
        const bgClass = uc.alt ? "border-y border-border bg-card/50" : "";

        return (
          <section key={uc.title} className={bgClass}>
            <div className="max-w-6xl mx-auto px-4 py-16">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-accent" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    {uc.title}
                  </h2>
                  <p className="text-muted text-lg mb-6">{uc.description}</p>
                  <ul className="space-y-3">
                    {uc.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                        <span className="text-muted">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8">
                  <h3 className="font-semibold mb-4 text-accent">
                    {uc.highlightTitle}
                  </h3>
                  <div className="space-y-4">
                    {uc.highlights.map((h) => (
                      <div key={h.label}>
                        <p className="font-medium">{h.label}</p>
                        <p className="text-muted text-sm">{h.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <CTASection
        title="Find Your Edge"
        subtitle="No matter your strategy, REI Reach gives you the tools to close more deals and build real wealth. Start free today."
        ctaLabel="Get Started Free"
        ctaHref="/signup"
      />

      <Footer />
    </div>
  );
}
