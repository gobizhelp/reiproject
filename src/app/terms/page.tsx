import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Terms of Service | REI Reach",
  description:
    "Terms of Service for REI Reach. Read our terms covering account usage, subscriptions, content policies, and communication consent.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <section className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted mb-12">Last updated: [Effective Date]</p>

        <div className="prose-custom space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-3">
              1. Acceptance of Terms
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                By accessing or using REI Reach (&ldquo;the Platform&rdquo;),
                operated by [Company Name] (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
                or &ldquo;our&rdquo;), you agree to be bound by these Terms of
                Service (&ldquo;Terms&rdquo;). If you do not agree to these
                Terms, do not use the Platform. We reserve the right to update
                these Terms at any time, and your continued use of the Platform
                constitutes acceptance of any changes.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              2. Description of Service
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                REI Reach is an online marketplace and platform that connects
                real estate wholesalers, investors, and agents for the purpose of
                buying, selling, and distributing off-market real estate deals.
                The Platform provides tools for listing properties, managing
                buyer criteria (&ldquo;buy boxes&rdquo;), automated matching,
                communication, deal analysis, and related services.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              3. User Accounts &amp; Registration
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                To use certain features of the Platform, you must create an
                account and provide accurate, current, and complete information.
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activities that occur under your
                account. You must be at least 18 years old to use the Platform.
                You agree to notify us immediately of any unauthorized use of
                your account.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              4. Subscription Plans &amp; Billing
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                The Platform offers Free, Pro, and Elite subscription tiers with
                varying features and limits. Paid subscriptions are billed on a
                monthly recurring basis. You authorize us to charge your
                designated payment method for all fees associated with your
                selected plan. You may upgrade, downgrade, or cancel your
                subscription at any time. Cancellations take effect at the end of
                the current billing period. Refunds are not provided for partial
                billing periods. Pricing is subject to change with 30 days&apos;
                notice.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              5. User Content &amp; Listings
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                You are solely responsible for all content you post on the
                Platform, including property listings, photos, descriptions,
                financial projections, and communications (&ldquo;User
                Content&rdquo;). You represent and warrant that your User Content
                is accurate, does not violate any laws, and does not infringe on
                the rights of any third party. We reserve the right to remove any
                User Content that violates these Terms or is otherwise
                objectionable. We do not guarantee the accuracy of any listings
                or financial information provided by other users. All investment
                decisions are made at your own risk.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              6. Communication Consent (SMS/Email)
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                By creating an account on REI Reach, you consent to receive
                communications from us, including:
              </p>
              <p>
                <strong className="text-foreground">
                  Email Communications:
                </strong>{" "}
                Account notifications, deal alerts, matching notifications,
                marketing communications, and platform updates. You may opt out
                of marketing emails at any time by clicking the unsubscribe link
                in any email.
              </p>
              <p>
                <strong className="text-foreground">
                  SMS/Text Messages:
                </strong>{" "}
                If you provide your phone number and opt in to SMS alerts, you
                consent to receive text messages from REI Reach related to deal
                alerts, matching notifications, account updates, and platform
                communications. Message frequency varies based on your account
                activity and notification preferences. Message and data rates may
                apply. You can opt out of SMS messages at any time by replying
                STOP to any message. For help, reply HELP or contact us at
                [Contact Email].
              </p>
              <p>
                <strong className="text-foreground">
                  Carrier Information:
                </strong>{" "}
                SMS messages are sent via standard messaging protocols. Supported
                carriers include all major U.S. carriers. We are not responsible
                for delayed or undelivered messages due to carrier issues.
              </p>
              <p>
                <strong className="text-foreground">
                  Your phone number will not be shared with third parties for
                  marketing purposes.
                </strong>
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              7. Prohibited Conduct
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                You agree not to: (a) use the Platform for any illegal purpose;
                (b) post false, misleading, or fraudulent listings or
                information; (c) harass, abuse, or threaten other users; (d)
                attempt to gain unauthorized access to the Platform or other
                users&apos; accounts; (e) use automated tools to scrape, crawl,
                or extract data from the Platform without permission; (f)
                interfere with or disrupt the Platform&apos;s operation; (g)
                violate any applicable local, state, national, or international
                law.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              8. Intellectual Property
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                The Platform, including its design, features, code, and content
                (excluding User Content), is the property of [Company Name] and
                is protected by copyright, trademark, and other intellectual
                property laws. You may not copy, modify, distribute, or create
                derivative works based on the Platform without our express
                written permission.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">9. Disclaimers</h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                The Platform is provided &ldquo;as is&rdquo; and &ldquo;as
                available&rdquo; without warranties of any kind, either express
                or implied. We do not warrant that the Platform will be
                uninterrupted, error-free, or secure. We do not endorse or
                guarantee any listings, users, or transactions on the Platform.
                Real estate transactions involve risk, and you should conduct
                your own due diligence before making any investment decisions.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              10. Limitation of Liability
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                To the maximum extent permitted by law, [Company Name] shall not
                be liable for any indirect, incidental, special, consequential,
                or punitive damages arising from your use of the Platform,
                including but not limited to lost profits, lost data, or business
                interruption, regardless of the theory of liability. Our total
                liability for any claims arising from your use of the Platform
                shall not exceed the amount you paid us in the twelve (12) months
                preceding the claim.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              11. Indemnification
            </h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                You agree to indemnify and hold harmless [Company Name], its
                officers, directors, employees, and agents from any claims,
                damages, losses, or expenses (including reasonable
                attorneys&apos; fees) arising from your use of the Platform, your
                User Content, or your violation of these Terms.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">12. Termination</h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                We may suspend or terminate your account at any time, with or
                without cause, and with or without notice. Upon termination, your
                right to use the Platform ceases immediately. Sections of these
                Terms that by their nature should survive termination will
                survive, including but not limited to intellectual property,
                disclaimers, limitation of liability, and indemnification.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">13. Governing Law</h2>
            <div className="text-muted space-y-3 leading-relaxed">
              <p>
                These Terms shall be governed by and construed in accordance with
                the laws of the State of [State], without regard to its conflict
                of law principles. Any disputes arising from these Terms shall be
                resolved in the courts located in [County], [State].
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">
              14. Contact Information
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
