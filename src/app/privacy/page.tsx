import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for REI Reach. Learn how we collect, use, and protect your personal information, including our SMS/text messaging practices.",
  openGraph: {
    title: "Privacy Policy",
    description:
      "Privacy Policy for REI Reach. Learn how we collect, use, and protect your personal information, including our SMS/text messaging practices.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted mb-12">Last updated: [Effective Date]</p>

        <div className="prose-custom space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                [Company Name] (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
                &ldquo;our&rdquo;) operates REI Reach (&ldquo;the
                Platform&rdquo;). This Privacy Policy describes how we collect,
                use, disclose, and protect your personal information when you use
                our Platform. By using REI Reach, you agree to the practices
                described in this policy.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              2. Information We Collect
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>We collect the following types of information:</p>
              <p>
                <strong className="text-foreground">
                  Personal Information:
                </strong>{" "}
                Name, email address, phone number, company name, mailing
                address, and other information you provide when creating an
                account, setting up your profile, or contacting us.
              </p>
              <p>
                <strong className="text-foreground">
                  Property &amp; Deal Information:
                </strong>{" "}
                Property addresses, financial details, photos, and other listing
                data you submit to the Platform.
              </p>
              <p>
                <strong className="text-foreground">Usage Information:</strong>{" "}
                How you interact with the Platform, including pages viewed,
                features used, search queries, and timestamps.
              </p>
              <p>
                <strong className="text-foreground">Device Information:</strong>{" "}
                IP address, browser type, operating system, and device
                identifiers collected automatically when you access the Platform.
              </p>
              <p>
                <strong className="text-foreground">
                  Payment Information:
                </strong>{" "}
                Billing details processed through our third-party payment
                processor. We do not store full credit card numbers on our
                servers.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              3. How We Use Your Information
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide, maintain, and improve the Platform</li>
                <li>Create and manage your account</li>
                <li>Process subscriptions and payments</li>
                <li>
                  Match properties to buyer criteria (buy boxes)
                </li>
                <li>
                  Send deal alerts, matching notifications, and platform
                  communications
                </li>
                <li>Provide customer support</li>
                <li>Analyze usage patterns to improve the Platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              4. SMS/Text Messaging
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                If you provide your phone number and opt in to SMS notifications:
              </p>
              <p>
                <strong className="text-foreground">Types of Messages:</strong>{" "}
                Deal alerts, buy box match notifications, account updates, and
                platform-related communications.
              </p>
              <p>
                <strong className="text-foreground">Message Frequency:</strong>{" "}
                Message frequency varies based on your activity, notification
                settings, and matching criteria. You may receive multiple
                messages per day when deals match your buy boxes.
              </p>
              <p>
                <strong className="text-foreground">Opt-Out:</strong> You can opt
                out of SMS messages at any time by replying STOP to any message.
                You may also manage your SMS preferences in your account
                settings.
              </p>
              <p>
                <strong className="text-foreground">Help:</strong> Reply HELP to
                any message for assistance, or contact us at [Contact Email].
              </p>
              <p>
                <strong className="text-foreground">
                  Message and data rates may apply.
                </strong>{" "}
                Check with your wireless carrier for details about your messaging
                plan.
              </p>
              <p>
                <strong className="text-foreground">
                  Your phone number will not be shared with, sold to, or provided
                  to any third parties for their marketing purposes.
                </strong>
              </p>
              <p>
                <strong className="text-foreground">
                  Carriers are not liable
                </strong>{" "}
                for delayed or undelivered messages.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              5. Information Sharing
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                We may share your information in the following circumstances:
              </p>
              <p>
                <strong className="text-foreground">With Other Users:</strong>{" "}
                Your profile information and listings are visible to other
                registered users as necessary for the Platform to function (e.g.,
                sellers see buyer inquiries, buyers see listing details).
              </p>
              <p>
                <strong className="text-foreground">Service Providers:</strong>{" "}
                We share information with third-party service providers who
                assist us in operating the Platform (hosting, email delivery, SMS
                delivery, payment processing, analytics). These providers are
                contractually required to protect your information.
              </p>
              <p>
                <strong className="text-foreground">Legal Requirements:</strong>{" "}
                We may disclose information if required by law, legal process, or
                government request, or to protect the rights, safety, or
                property of [Company Name], our users, or the public.
              </p>
              <p>
                <strong className="text-foreground">Business Transfers:</strong>{" "}
                In the event of a merger, acquisition, or sale of assets, your
                information may be transferred as part of the transaction.
              </p>
              <p>
                <strong className="text-foreground">
                  We do not sell your personal information to third parties.
                </strong>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                We implement industry-standard security measures to protect your
                personal information, including encryption in transit (TLS/SSL),
                secure authentication, and access controls. However, no method of
                transmission over the Internet or electronic storage is 100%
                secure. We cannot guarantee absolute security.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              7. Cookies &amp; Tracking
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Maintain your session and authentication state</li>
                <li>Remember your preferences</li>
                <li>Analyze Platform usage and performance</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Disabling
                cookies may affect the functionality of the Platform.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                Depending on your jurisdiction, you may have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong className="text-foreground">Access</strong> your
                  personal information
                </li>
                <li>
                  <strong className="text-foreground">Correct</strong> inaccurate
                  personal information
                </li>
                <li>
                  <strong className="text-foreground">Delete</strong> your
                  personal information
                </li>
                <li>
                  <strong className="text-foreground">Object to</strong> or
                  restrict certain processing of your information
                </li>
                <li>
                  <strong className="text-foreground">Data Portability</strong>{" "}
                  — request a copy of your data in a portable format
                </li>
              </ul>
              <p>
                To exercise any of these rights, contact us at [Contact Email].
                We will respond to your request within 30 days.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">9. Data Retention</h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                We retain your personal information for as long as your account
                is active or as needed to provide services. After account
                deletion, we may retain certain information as required by law or
                for legitimate business purposes (such as resolving disputes).
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              10. Children&apos;s Privacy
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                The Platform is not intended for use by individuals under the age
                of 18. We do not knowingly collect personal information from
                children. If we learn that we have collected information from a
                child under 18, we will delete it promptly.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              11. Changes to This Policy
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                We may update this Privacy Policy from time to time. We will
                notify you of material changes by posting the updated policy on
                the Platform and updating the &ldquo;Last updated&rdquo; date.
                Your continued use of the Platform after changes are posted
                constitutes acceptance of the updated policy.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              12. Contact Information
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>[Company Name]</p>
              <p>[Company Address]</p>
              <p>Email: [Contact Email]</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
