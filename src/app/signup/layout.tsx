import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your free REI Reach account. Start browsing off-market deals and connecting with investors in under 60 seconds.",
  openGraph: {
    title: "Sign Up",
    description:
      "Create your free REI Reach account. Start browsing off-market deals and connecting with investors in under 60 seconds.",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
