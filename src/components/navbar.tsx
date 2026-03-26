"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2, LogOut, Users, Search, Settings, ArrowLeftRight, ShoppingCart, Home,
  Package, ChevronDown, Heart, MessageCircle
} from "lucide-react";
import type { Profile, ActiveView } from "@/lib/profile-types";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [switching, setSwitching] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
      }
    }
    loadProfile();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function switchView(view: ActiveView) {
    if (!profile || switching) return;
    setSwitching(true);
    setShowViewMenu(false);

    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ active_view: view })
      .eq("id", profile.id);

    setProfile({ ...profile, active_view: view });
    setSwitching(false);

    // Navigate to the appropriate home page
    if (view === "buyer") {
      router.push("/marketplace");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      pathname.startsWith(href)
        ? "text-foreground"
        : "text-muted hover:text-foreground"
    }`;

  const isBuyer = profile?.active_view === "buyer";
  const isBoth = profile?.user_role === "both";

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={isBuyer ? "/marketplace" : "/dashboard"} className="flex items-center gap-2">
            <Building2 className="w-7 h-7 text-accent" />
            <span className="text-xl font-bold">DealPacket</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            {isBuyer ? (
              <>
                <Link href="/marketplace" className={linkClass("/marketplace")}>
                  <span className="flex items-center gap-1.5">
                    <Search className="w-4 h-4" />
                    Marketplace
                  </span>
                </Link>
                <Link href="/saved-listings" className={linkClass("/saved-listings")}>
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    Saved
                  </span>
                </Link>
                <Link href="/my-buy-boxes" className={linkClass("/my-buy-boxes")}>
                  <span className="flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    My Buy Boxes
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className={linkClass("/dashboard")}>
                  Properties
                </Link>
                <Link href="/messages" className={linkClass("/messages")}>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    Messages
                  </span>
                </Link>
                <Link href="/buyers" className={linkClass("/buyers")}>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Buyers
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Switcher for "both" users */}
          {isBoth && (
            <div className="relative">
              <button
                onClick={() => setShowViewMenu(!showViewMenu)}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  showViewMenu ? "border-accent bg-accent/10 text-accent" : "border-border text-muted hover:text-foreground hover:border-muted"
                }`}
              >
                {isBuyer ? (
                  <><ShoppingCart className="w-4 h-4" /> Buyer</>
                ) : (
                  <><Building2 className="w-4 h-4" /> Seller</>
                )}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showViewMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowViewMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
                    <button
                      onClick={() => switchView("seller")}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                        !isBuyer ? "text-accent bg-accent/10" : "text-muted hover:text-foreground hover:bg-card-hover"
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      Seller View
                    </button>
                    <button
                      onClick={() => switchView("buyer")}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                        isBuyer ? "text-accent bg-accent/10" : "text-muted hover:text-foreground hover:bg-card-hover"
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buyer View
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile nav links */}
          {isBuyer ? (
            <>
              <Link href="/marketplace" className="md:hidden text-muted hover:text-foreground transition-colors">
                <Search className="w-5 h-5" />
              </Link>
              <Link href="/saved-listings" className="md:hidden text-muted hover:text-foreground transition-colors">
                <Heart className="w-5 h-5" />
              </Link>
              <Link href="/my-buy-boxes" className="md:hidden text-muted hover:text-foreground transition-colors">
                <Package className="w-5 h-5" />
              </Link>
            </>
          ) : (
            <>
              <Link href="/messages" className="md:hidden text-muted hover:text-foreground transition-colors">
                <MessageCircle className="w-5 h-5" />
              </Link>
              <Link href="/buyers" className="md:hidden text-muted hover:text-foreground transition-colors">
                <Users className="w-5 h-5" />
              </Link>
            </>
          )}

          <Link href="/settings" className="text-muted hover:text-foreground transition-colors">
            <Settings className="w-4 h-4" />
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
