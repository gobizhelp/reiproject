import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Log in to your REI Reach account to manage deals, buy boxes, and connect with investors.",
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
