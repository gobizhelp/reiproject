import type { Metadata } from "next";
import "./globals.css";
import ImpersonationBanner from "@/components/impersonation-banner";

export const metadata: Metadata = {
  title: "DealPacket - Off Market Real Estate Deals",
  description: "Create and share off-market real estate deal packets with investors and buyers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ImpersonationBanner />
        {children}
      </body>
    </html>
  );
}
