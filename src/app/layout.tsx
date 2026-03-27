import type { Metadata } from "next";
import "./globals.css";
import ImpersonationBanner from "@/components/impersonation-banner";
import NotificationProvider from "@/components/notification-provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://reireach.com"),
  title: {
    default: "REI Reach - Off-Market Real Estate Wholesale Marketplace",
    template: "%s | REI Reach",
  },
  description: "Close more off-market deals faster. REI Reach connects wholesalers with qualified buyers through professional deal packets, instant matching, and built-in deal analysis.",
  openGraph: {
    type: "website",
    siteName: "REI Reach",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
