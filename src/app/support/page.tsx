import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/marketing-nav";
import Footer from "@/components/marketing/footer";
import HelpCenter from "./help-center";

export const metadata: Metadata = {
  title: "Support | REI Reach",
  description:
    "Get help with REI Reach. Browse our help center for guides on getting started, buying, selling, billing, and account management.",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <HelpCenter />
      <Footer />
    </div>
  );
}
