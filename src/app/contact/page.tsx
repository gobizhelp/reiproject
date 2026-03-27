import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";
import ContactForm from "./contact-form";
import { Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | REI Reach",
  description:
    "Get in touch with the REI Reach team. Questions, partnerships, demo requests, or support — we'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4">Get In Touch</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Let&apos;s Talk</h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Questions, partnerships, or demo requests — we&rsquo;d love to hear from you. Our team typically responds within 24 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          {/* Form - takes 2 columns */}
          <div className="md:col-span-2">
            {/* GHL FORM EMBED PLACEHOLDER - Replace ContactForm with GHL embed code when ready */}
            <ContactForm />
          </div>

          {/* Sidebar info */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <Mail className="w-6 h-6 text-accent mb-3" />
              <h3 className="font-semibold mb-1">Email Us</h3>
              <p className="text-muted text-sm">support@reireach.com</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <Clock className="w-6 h-6 text-accent mb-3" />
              <h3 className="font-semibold mb-1">Response Time</h3>
              <p className="text-muted text-sm">We typically respond within 24 hours during business days.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
