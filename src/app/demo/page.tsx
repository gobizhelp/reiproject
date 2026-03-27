"use client";

import { useEffect, useRef, useState } from "react";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";
import CTASection from "@/components/marketing/cta-section";
import {
  Upload,
  Camera,
  BarChart3,
  Target,
  Bell,
  MessageCircle,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Home,
  TrendingUp,
} from "lucide-react";

function DemoStep({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className={step % 2 === 0 ? "md:order-2" : ""}>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent text-lg font-bold mb-4">
              {step}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{title}</h2>
            <p className="text-muted text-lg">{description}</p>
          </div>
          <div className={step % 2 === 0 ? "md:order-1" : ""}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
          Platform Demo
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          See REI Reach
          <br />
          <span className="text-accent">In Action</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto">
          Watch how top wholesalers and investors use REI Reach to close deals
          faster. Four steps, one platform, real results.
        </p>
      </section>

      {/* Step 1: Create a Listing */}
      <DemoStep
        step={1}
        title="Create a Professional Listing"
        description="Upload photos, add property details and comps, and watch the platform auto-generate a complete deal analysis with MAO, ROI, and profit projections. Your deals look professional because they are."
      >
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Upload className="w-5 h-5 text-accent" />
            <span className="font-semibold">New Listing</span>
          </div>
          <div className="space-y-3">
            <div className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-muted">
              123 Oak Street, Phoenix, AZ
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-center">
                <span className="text-muted text-xs block">Asking</span>
                <span className="font-semibold text-success">$145,000</span>
              </div>
              <div className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-center">
                <span className="text-muted text-xs block">ARV</span>
                <span className="font-semibold">$220,000</span>
              </div>
              <div className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-center">
                <span className="text-muted text-xs block">ROI</span>
                <span className="font-semibold text-accent">32%</span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-16 h-12 bg-card-hover border border-border rounded-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-muted" />
              </div>
              <div className="w-16 h-12 bg-card-hover border border-border rounded-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-muted" />
              </div>
              <div className="w-16 h-12 bg-card-hover border border-border rounded-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-muted" />
              </div>
            </div>
          </div>
        </div>
      </DemoStep>

      {/* Step 2: Set a Buy Box */}
      <div className="border-y border-border bg-card/50">
        <DemoStep
          step={2}
          title="Set Your Buy Box Criteria"
          description="Define your ideal deal once — location, price range, property type, investment strategy. The platform remembers your criteria and matches you to every new deal that fits."
        >
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-accent" />
              <span className="font-semibold">My Buy Box</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-2.5 text-sm">
                <span className="text-muted">Location</span>
                <span>Phoenix, AZ</span>
              </div>
              <div className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-2.5 text-sm">
                <span className="text-muted">Price Range</span>
                <span>$100K – $200K</span>
              </div>
              <div className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-2.5 text-sm">
                <span className="text-muted">Property Type</span>
                <span>Single Family</span>
              </div>
              <div className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-2.5 text-sm">
                <span className="text-muted">Strategy</span>
                <span>Fix & Flip</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle className="w-4 h-4" /> Buy box active — matching
                enabled
              </div>
            </div>
          </div>
        </DemoStep>
      </div>

      {/* Step 3: Instant Match */}
      <DemoStep
        step={3}
        title="Instant Match & Alert"
        description="The moment a new listing matches your buy box, you're notified. Email, SMS, or in-app — you choose. While your competitors are still searching, you're already reviewing the deal."
      >
        <div className="space-y-3">
          <div className="bg-card border border-accent/50 rounded-2xl p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                New Match: 123 Oak Street
              </p>
              <p className="text-muted text-xs mt-0.5">
                Matches your &quot;Phoenix Flips&quot; buy box
              </p>
              <div className="flex gap-3 mt-2">
                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                  $145,000
                </span>
                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                  32% ROI
                </span>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4 opacity-60">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
              <Home className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                New Match: 456 Pine Ave
              </p>
              <p className="text-muted text-xs mt-0.5">
                Matches your &quot;Rental Portfolio&quot; buy box
              </p>
              <div className="flex gap-3 mt-2">
                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                  $178,000
                </span>
                <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                  18% ROI
                </span>
              </div>
            </div>
          </div>
        </div>
      </DemoStep>

      {/* Step 4: Close the Deal */}
      <div className="border-y border-border bg-card/50">
        <DemoStep
          step={4}
          title="Close the Deal"
          description="Send inquiries, negotiate through built-in messaging, and track every deal through your pipeline. From first look to closing — all in one place."
        >
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="w-5 h-5 text-accent" />
              <span className="font-semibold">Deal Pipeline</span>
            </div>
            {[
              { label: "123 Oak St", status: "Contacted", color: "text-accent" },
              {
                label: "789 Elm Dr",
                status: "Reviewing",
                color: "text-amber-400",
              },
              {
                label: "456 Pine Ave",
                status: "Under Contract",
                color: "text-success",
              },
            ].map((deal) => (
              <div
                key={deal.label}
                className="flex items-center justify-between bg-background border border-border rounded-lg px-4 py-3 text-sm"
              >
                <span>{deal.label}</span>
                <span className={`text-xs font-medium ${deal.color}`}>
                  {deal.status}
                </span>
              </div>
            ))}
          </div>
        </DemoStep>
      </div>

      <CTASection
        title="Ready to Try It Yourself?"
        subtitle="Everything you just saw is available right now. Create your free account and start closing deals today."
        ctaLabel="Start Free"
        ctaHref="/signup"
      />

      <Footer />
    </div>
  );
}
