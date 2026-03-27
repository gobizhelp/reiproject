import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo",
  description:
    "See REI Reach in action. Walk through the deal packet builder, buyer matching, and marketplace features.",
  openGraph: {
    title: "Demo",
    description:
      "See REI Reach in action. Walk through the deal packet builder, buyer matching, and marketplace features.",
  },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
