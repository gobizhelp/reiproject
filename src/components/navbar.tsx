"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LogOut, Users } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      pathname.startsWith(href)
        ? "text-foreground"
        : "text-muted hover:text-foreground"
    }`;

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Building2 className="w-7 h-7 text-accent" />
            <span className="text-xl font-bold">DealPacket</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              Properties
            </Link>
            <Link href="/buyers" className={linkClass("/buyers")}>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Buyers
              </span>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/buyers" className="md:hidden text-muted hover:text-foreground transition-colors">
            <Users className="w-5 h-5" />
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
