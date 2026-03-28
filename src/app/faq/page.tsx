import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";
import HeroSection from "@/components/marketing/hero-section";
import FAQAccordion from "@/components/marketing/faq-accordion";
import CTASection from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about REI Reach — who it's for, how matching works, pricing plans, alerts, and more.",
  openGraph: {
    title: "FAQ",
    description:
      "Answers to common questions about REI Reach — who it's for, how matching works, pricing plans, alerts, and more.",
  },
};

const faqItems = [
  { question: "Who is REI Reach for?", answer: "REI Reach is built for anyone involved in off-market real estate — wholesalers, cash buyers, fix-and-flip investors, buy-and-hold investors, hedge fund buyers, and agents with off-market inventory. Whether you're moving one deal a month or fifty, the platform adapts to your workflow." },
  { question: "Is REI Reach only for wholesalers?", answer: "No. While wholesalers are a core user group (as sellers), the platform is equally powerful for buyers — cash investors, flippers, rental portfolio builders, and institutional buyers all use REI Reach to find deals that match their criteria." },
  { question: "Can I be both a buyer and a seller?", answer: "Absolutely. Many of our users operate on both sides. You can switch between buyer and seller views instantly, and manage both roles from a single account with a combined subscription plan." },
  { question: "How does matching work?", answer: "When a seller publishes a listing, our algorithm compares the property details against every active buy box on the platform. Buyers whose criteria match — location, price range, property type, strategy — are notified instantly. It's automatic, accurate, and fast." },
  { question: "How do alerts work?", answer: "Free users receive daily email digests of matching deals. Pro users get instant email alerts. Elite users get both instant email and SMS alerts. You can customize your notification preferences at any time." },
  { question: "Are listings public or private?", answer: "Published listings are visible to registered users in the marketplace. Sellers can also share deal packet links publicly. Draft listings remain private until you choose to publish them." },
  { question: "What does the free plan include?", answer: "The free plan gives you access to core features — one active listing (sellers), one buy box (buyers), basic search, daily email digests, and the ability to contact other users. It's a fully functional starting point with no credit card required." },
  { question: "How do paid tiers work?", answer: "Pro and Elite plans unlock advanced features like instant alerts, SMS notifications, first-look access, team seats, and more. Plans are billed monthly and you can upgrade, downgrade, or cancel at any time." },
  { question: "Can I cancel anytime?", answer: "Yes. There are no long-term contracts. You can cancel your subscription at any time and your account will revert to the free plan at the end of your billing period." },
  { question: "How do I get started?", answer: "Sign up for free in under 60 seconds. Choose your role (buyer, seller, or both), set up your profile, and you're ready to go. No credit card required." },
  { question: "Is my data secure?", answer: "Yes. We use industry-standard encryption, secure authentication through Supabase, and never share your personal information with third parties. Your deal data and contact information are protected." },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          }),
        }}
      />
      <MarketingNav />

      <HeroSection
        eyebrow="Frequently Asked Questions"
        title="Questions?"
        titleAccent="We've Got Answers."
        subtitle="Everything you need to know about REI Reach. Can't find your answer? Reach out to our team."
      />

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-12">
        {/* General */}
        <div>
          <h3 className="text-xl font-semibold mb-4">General</h3>
          <FAQAccordion items={faqItems.slice(0, 3)} />
        </div>

        {/* Platform */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Platform</h3>
          <FAQAccordion items={faqItems.slice(3, 6)} />
        </div>

        {/* Pricing */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Pricing</h3>
          <FAQAccordion items={faqItems.slice(6, 9)} />
        </div>

        {/* Account */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Account</h3>
          <FAQAccordion items={faqItems.slice(9)} />
        </div>
      </div>

      <CTASection
        title="Still Have Questions?"
        subtitle="Our team is here to help. Reach out anytime and we'll get back to you within 24 hours."
        ctaLabel="Contact Us"
        ctaHref="/contact"
      />

      <Footer />
    </div>
  );
}
