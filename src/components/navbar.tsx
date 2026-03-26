"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, LogOut } from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Building2 className="w-7 h-7 text-accent" />
          <span className="text-xl font-bold">DealPacket</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </nav>
  );
}
