"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2, LogOut, Users, Search, Settings, ArrowLeftRight, ShoppingCart, Home,
  Package, ChevronDown, Heart, MessageCircle, Shield, Volume2, VolumeX, Target, GripVertical
} from "lucide-react";
import type { Profile, ActiveView } from "@/lib/profile-types";
import { useNotifications } from "@/components/notification-provider";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [switching, setSwitching] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const { unreadCount, soundEnabled, toggleSound } = useNotifications();

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

  const secondaryLinkClass = (href: string) =>
    `text-xs font-medium transition-colors px-2.5 py-1 rounded-md ${
      pathname.startsWith(href)
        ? "text-foreground bg-card-hover"
        : "text-muted hover:text-foreground hover:bg-card-hover"
    }`;

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={isBuyer ? "/marketplace" : "/dashboard"} className="flex items-center gap-2">
            <Building2 className="w-7 h-7 text-accent" />
            <span className="text-xl font-bold">REI Reach</span>
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
                <Link href="/matched-listings" className={linkClass("/matched-listings")}>
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4" />
                    Matched
                  </span>
                </Link>
                <Link href="/messages" className={linkClass("/messages")}>
                  <span className="flex items-center gap-1.5 relative">
                    <MessageCircle className="w-4 h-4" />
                    Messages
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-4 bg-accent text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className={linkClass("/dashboard")}>
                  Properties
                </Link>
                <Link href="/messages" className={linkClass("/messages")}>
                  <span className="flex items-center gap-1.5 relative">
                    <MessageCircle className="w-4 h-4" />
                    Messages
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-4 bg-accent text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
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
              <Link href="/matched-listings" className="md:hidden text-muted hover:text-foreground transition-colors">
                <Target className="w-5 h-5" />
              </Link>
            </>
          ) : (
            <>
              <Link href="/messages" className="md:hidden text-muted hover:text-foreground transition-colors relative">
                <MessageCircle className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-0.5">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/buyers" className="md:hidden text-muted hover:text-foreground transition-colors">
                <Users className="w-5 h-5" />
              </Link>
            </>
          )}

          {profile?.is_admin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-lg border border-orange-500/20 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden md:inline">Admin Dashboard</span>
            </Link>
          )}
          <button
            onClick={toggleSound}
            className="text-muted hover:text-foreground transition-colors"
            title={soundEnabled ? "Mute notification sounds" : "Enable notification sounds"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
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

      {/* Secondary navigation bar */}
      {isBuyer && (
        <div className="border-t border-border">
          <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center gap-2">
            <Link href="/saved-listings" className={secondaryLinkClass("/saved-listings")}>
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                Saved
              </span>
            </Link>
            <Link href="/deal-pipeline" className={secondaryLinkClass("/deal-pipeline")}>
              <span className="flex items-center gap-1.5">
                <GripVertical className="w-3.5 h-3.5" />
                Pipeline
              </span>
            </Link>
            <Link href="/my-buy-boxes" className={secondaryLinkClass("/my-buy-boxes")}>
              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                My Buy Boxes
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
