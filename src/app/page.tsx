import Link from "next/link";
import {
  ArrowRight,
  Target,
  TrendingUp,
  Users,
  Shield,
  Zap,
  DollarSign,
} from "lucide-react";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
          The Off-Market Real Estate Marketplace
        </p>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Close More Deals.<br />
          <span className="text-accent">Build Real Wealth.</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Stop leaving money on the table. REI Reach connects wholesalers with
          qualified buyers so you move properties faster, earn bigger assignment
          fees, and build the financial security your family deserves.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
          >
            Start Closing Deals <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 border border-border hover:border-accent text-foreground px-8 py-4 rounded-xl text-lg font-medium transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-accent">$0</p>
              <p className="text-muted text-sm mt-1">Free to get started</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">Instant</p>
              <p className="text-muted text-sm mt-1">Buyer-seller matching</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">Auto</p>
              <p className="text-muted text-sm mt-1">Deal analysis &amp; ROI</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">1-Click</p>
              <p className="text-muted text-sm mt-1">Professional sharing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Agitation */}
      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Tired of Deals Falling Through the Cracks?
        </h2>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          Every day you spend chasing unqualified buyers or digging through
          scattered spreadsheets is a day your competitors are closing. The
          wholesalers who win aren&apos;t working harder &mdash; they have a
          system that puts their deals in front of the right buyers,
          instantly.
        </p>
      </section>

      {/* Features — For Sellers */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          For Wholesalers &amp; Sellers
        </h2>
        <p className="text-muted text-center max-w-2xl mx-auto mb-12">
          Move properties faster and keep more money in your pocket.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-2xl p-8">
            <DollarSign className="w-10 h-10 text-success mb-4" />
            <h3 className="text-xl font-semibold mb-2">Maximize Your Assignment Fees</h3>
            <p className="text-muted">
              Professional deal packets with auto-calculated MAO, ROI, and
              profit projections make buyers confident enough to pay top
              dollar.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8">
            <Target className="w-10 h-10 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">Reach Qualified Buyers Instantly</h3>
            <p className="text-muted">
              Your listings are automatically matched to buyers whose buy
              boxes fit your deal &mdash; no more blasting and hoping.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8">
            <Zap className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Close in Days, Not Weeks</h3>
            <p className="text-muted">
              One-click shareable links, email blasts, and real-time
              messaging eliminate the back-and-forth that kills deals.
            </p>
          </div>
        </div>
      </section>

      {/* Features — For Buyers */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          For Investors &amp; Buyers
        </h2>
        <p className="text-muted text-center max-w-2xl mx-auto mb-12">
          Find deals that match your criteria before anyone else.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-2xl p-8">
            <Shield className="w-10 h-10 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">Invest With Confidence</h3>
            <p className="text-muted">
              Every deal comes with comps, photos, and full financial
              analysis so you never overpay or chase bad numbers.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8">
            <TrendingUp className="w-10 h-10 text-success mb-4" />
            <h3 className="text-xl font-semibold mb-2">First-Look Access to Off-Market Deals</h3>
            <p className="text-muted">
              Set your buy box once and get instant alerts the moment a
              matching deal drops &mdash; before the competition even knows
              it exists.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8">
            <Users className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Build Your Portfolio Faster</h3>
            <p className="text-muted">
              Track deals in your pipeline, collaborate with your team, and
              scale your acquisitions &mdash; all from one platform.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Next Deal Is Waiting
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto mb-8">
            Join the wholesalers and investors who are already closing faster
            and building generational wealth. Getting started is free.
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
