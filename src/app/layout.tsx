import type { Metadata } from "next";
import "./globals.css";
import ImpersonationBanner from "@/components/impersonation-banner";
import NotificationProvider from "@/components/notification-provider";

export const metadata: Metadata = {
  title: "DealPacket - Off-Market Real Estate Wholesale Marketplace",
  description: "Close more off-market deals faster. DealPacket connects wholesalers with qualified buyers through professional deal packets, instant matching, and built-in deal analysis.",
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
