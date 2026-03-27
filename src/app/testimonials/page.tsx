import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";
import HeroSection from "@/components/marketing/hero-section";

export const metadata: Metadata = {
  title: "Testimonials | REI Reach",
  description:
    "Hear from real wholesalers and investors using REI Reach to close more deals and build wealth.",
};

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <HeroSection
        eyebrow="Testimonials"
        title="What Our Users"
        titleAccent="Are Saying"
        subtitle="Real results from real investors. See how wholesalers and buyers are using REI Reach to close more deals and build generational wealth."
      />

      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-8 text-center"
            >
              <MessageSquare className="w-10 h-10 text-border mx-auto mb-4" />
              <p className="text-muted text-sm">Coming soon</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <p className="text-muted text-lg mb-2">
            We're just getting started — and building something special.
          </p>
          <p className="text-muted">
            The first investors on the platform are already closing. Their
            stories will be here soon.
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Be One of Our First Success Stories
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto mb-8">
            Join now, start closing deals, and your results could be featured
            here. Getting started is free.
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
