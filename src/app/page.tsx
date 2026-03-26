import Link from "next/link";
import { Building2, Share2, BarChart3, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-7 h-7 text-accent" />
            <span className="text-xl font-bold">DealPacket</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-muted hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Share Off-Market Deals<br />
          <span className="text-accent">Like a Pro</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Create professional deal packets for your off-market properties.
          Share a single link with investors showing deal analysis, photos, comps, and more.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
        >
          Get Started <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-2xl p-8">
            <Building2 className="w-10 h-10 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">Property Details</h3>
            <p className="text-muted">
              Add address, photos, beds, baths, sqft, and all the details buyers need to evaluate your deal.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8">
            <BarChart3 className="w-10 h-10 text-success mb-4" />
            <h3 className="text-xl font-semibold mb-2">Deal Analysis</h3>
            <p className="text-muted">
              Auto-calculated MAO, ROI, and profit projections. Add comps to back up your ARV.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8">
            <Share2 className="w-10 h-10 text-accent mb-4" />
            <h3 className="text-xl font-semibold mb-2">One-Click Share</h3>
            <p className="text-muted">
              Get a professional shareable link. Send it to your buyers list and close deals faster.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
