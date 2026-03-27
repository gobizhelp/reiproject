"use client";

import { useState } from "react";
import {
  Rocket,
  ShoppingCart,
  Store,
  CreditCard,
  Settings,
} from "lucide-react";
import FAQAccordion from "@/components/marketing/faq-accordion";

const categories = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: Rocket,
    items: [
      {
        question: "How do I create an account?",
        answer:
          "Sign up for free at reireach.com/signup. Choose your role (buyer, seller, or both), fill in your profile details, and you're ready to start. No credit card required.",
      },
      {
        question: "How do I create my first listing?",
        answer:
          "Go to your dashboard, click 'New Listing', and fill in the property details. Upload photos, add comparable sales, and the platform will auto-generate a deal analysis with MAO, ROI, and profit projections. Publish when you're ready.",
      },
      {
        question: "How do I set up my first buy box?",
        answer:
          "Navigate to 'My Buy Boxes' from the buyer menu. Click 'Create Buy Box' and define your criteria — location, price range, property type, and investment strategy. Once saved, the platform will automatically match new listings to your criteria.",
      },
      {
        question: "What's the difference between buyer and seller accounts?",
        answer:
          "Seller accounts are for posting deals and distributing them to buyers. Buyer accounts are for browsing, matching, and tracking deals. You can sign up as both and switch between views at any time.",
      },
    ],
  },
  {
    id: "buyer-guide",
    label: "Buyer Guide",
    icon: ShoppingCart,
    items: [
      {
        question: "What is a buy box?",
        answer:
          "A buy box is a set of criteria that defines your ideal deal — location, price range, property type, beds, baths, investment strategy, and more. The platform uses your buy box to automatically match you with new listings that fit.",
      },
      {
        question: "How do I get deal alerts?",
        answer:
          "Deal alerts are automatic. Free users get daily email digests. Pro users get instant email alerts. Elite users get instant email and SMS alerts. Make sure your notification preferences are set in your account settings.",
      },
      {
        question: "How does the deal pipeline work?",
        answer:
          "The deal pipeline lets you track deals through stages — Saved, Reviewing, Contacted, Under Contract, and Closed. Move deals between stages as they progress, add notes, and keep your acquisitions organized.",
      },
      {
        question: "What is first-look access?",
        answer:
          "Elite buyers get exclusive early access to new listings before they're visible to all users. This gives you a head start on the best deals — typically a 24-hour window.",
      },
    ],
  },
  {
    id: "seller-guide",
    label: "Seller Guide",
    icon: Store,
    items: [
      {
        question: "How do I create a professional listing?",
        answer:
          "Use the listing form to add property details, upload photos, and include comparable sales. The platform auto-generates a deal analysis with MAO, ROI, and profit projections. Your listing becomes a professional deal packet that buyers trust.",
      },
      {
        question: "How do email blasts work?",
        answer:
          "Pro and Elite sellers can send email blasts to matched buyers. When you publish a listing, go to the distribution options and click 'Send Email Blast'. All buyers whose buy boxes match your deal will receive the notification.",
      },
      {
        question: "How do I track listing performance?",
        answer:
          "Your dashboard shows analytics for each listing — views, saves, inquiries, and more. Pro and Elite sellers get detailed analytics to understand which deals generate the most interest.",
      },
      {
        question: "What are shareable deal packet links?",
        answer:
          "Every published listing gets a unique URL you can share anywhere — email, text, social media. Recipients see a professional deal packet with all property details, photos, comps, and financial analysis.",
      },
    ],
  },
  {
    id: "billing",
    label: "Billing & Plans",
    icon: CreditCard,
    items: [
      {
        question: "What's included in the free plan?",
        answer:
          "The free plan includes one active listing (sellers), one buy box (buyers), basic search, daily email digests, the ability to save listings, and contact other users. It's a fully functional starting point.",
      },
      {
        question: "How do I upgrade my plan?",
        answer:
          "Go to Settings > Subscription and choose your desired plan. Upgrades take effect immediately and you'll be billed on a prorated basis for the remainder of the billing period.",
      },
      {
        question: "Can I downgrade or cancel?",
        answer:
          "Yes. You can downgrade or cancel at any time from your subscription settings. Changes take effect at the end of your current billing period. Your account reverts to the free plan upon cancellation.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "We do not offer refunds for partial billing periods. If you cancel mid-cycle, you'll continue to have access to your paid features until the end of the billing period.",
      },
    ],
  },
  {
    id: "account",
    label: "Account & Security",
    icon: Settings,
    items: [
      {
        question: "How do I update my profile?",
        answer:
          "Go to Settings from the main navigation. You can update your name, company, phone number, email, and other profile details at any time.",
      },
      {
        question: "How do I change my notification preferences?",
        answer:
          "In Settings, you can control which notifications you receive — email alerts, SMS alerts (if on a supported plan), and in-app notifications. You can also toggle notification sounds.",
      },
      {
        question: "Is my data secure?",
        answer:
          "Yes. We use industry-standard encryption (TLS/SSL), secure authentication through Supabase, and strict access controls. Your personal and deal data is protected. See our Privacy Policy for full details.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Contact our support team at support@reireach.com to request account deletion. We'll process your request and remove your personal data in accordance with our Privacy Policy.",
      },
    ],
  },
];

export default function HelpCenter() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const activeCategoryData = categories.find((c) => c.id === activeCategory);

  return (
    <main>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">
          Support Center
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          How Can We Help?
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          Browse our help center or contact our team directly. We&apos;re here
          to make sure you get the most out of REI Reach.
        </p>
      </section>

      {/* Category Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setActiveCategory(activeCategory === cat.id ? null : cat.id)
              }
              className={`bg-card border rounded-xl p-6 text-center transition-colors ${
                activeCategory === cat.id
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <cat.icon
                className={`w-8 h-8 mx-auto mb-3 ${
                  activeCategory === cat.id ? "text-accent" : "text-muted"
                }`}
              />
              <p className="font-medium text-sm">{cat.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Content */}
      {activeCategory && activeCategoryData && (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">
            {activeCategoryData.label}
          </h2>
          <FAQAccordion items={activeCategoryData.items} />
        </div>
      )}

      {/* Bottom CTA */}
      <section className="border-t border-border bg-card/50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Can&apos;t Find What You Need?
          </h2>
          <p className="text-muted mb-6">
            Our team is here to help. Reach out and we&apos;ll get back to you
            within 24 hours.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Contact Support
          </a>
        </div>
      </section>
    </main>
  );
}
