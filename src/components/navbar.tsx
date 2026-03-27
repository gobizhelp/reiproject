"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2, LogOut, Users, Search, Settings, ShoppingCart,
  Package, Heart, MessageCircle, Shield, Volume2, VolumeX, Target, GripVertical,
  Bell, Check, Clock, CheckCircle, Archive, RotateCcw
} from "lucide-react";
import type { Profile, ActiveView } from "@/lib/profile-types";
import { useNotifications } from "@/components/notification-provider";

// Module-level cache so profile survives component remounts from router.refresh()
let cachedProfile: Profile | null = null;

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(cachedProfile);
  const [switching, setSwitching] = useState(false);
  const {
    unreadCount, soundEnabled, toggleSound,
    persistedNotifications, persistedUnreadCount,
    markNotificationRead, markAllNotificationsRead,
  } = useNotifications();
  const [showNotifPanel, setShowNotifPanel] = useState(false);

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
        cachedProfile = data as Profile;
        setProfile(cachedProfile);
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

    // Update cache immediately so the remount after navigation picks up the new view
    cachedProfile = { ...profile, active_view: view };

    const supabase = createClient();
    // Fire DB update without awaiting — navigate immediately for snappy feel
    supabase
      .from("profiles")
      .update({ active_view: view })
      .eq("id", profile.id);

    // Navigate first — the page and nav will update together on remount
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

  const profileLoaded = profile !== null;
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
            <Image src="/logo.svg" alt="REI Reach" width={28} height={28} />
            <span className="text-xl font-bold">REI Reach</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            {!profileLoaded ? (
              <div className="flex items-center gap-4">
                <span className="h-4 w-20 bg-border/50 rounded animate-pulse" />
                <span className="h-4 w-16 bg-border/50 rounded animate-pulse" />
                <span className="h-4 w-18 bg-border/50 rounded animate-pulse" />
              </div>
            ) : (
              <div className="flex items-center gap-4 transition-opacity duration-200" key={isBuyer ? "buyer" : "seller"}>
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
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* View Switcher for "both" users */}
          {isBoth && (
            <div className="flex items-center bg-border/50 rounded-lg p-0.5">
              <button
                onClick={() => switchView("seller")}
                disabled={switching}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-md transition-all ${
                  !isBuyer
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Building2 className="w-4 h-4" />
                Seller
              </button>
              <button
                onClick={() => switchView("buyer")}
                disabled={switching}
                className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-md transition-all ${
                  isBuyer
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                Buyer
              </button>
            </div>
          )}

          {/* Mobile nav links */}
          {profileLoaded && (isBuyer ? (
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
          ))}

          {profile?.is_admin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-lg border border-orange-500/20 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden md:inline">Admin Dashboard</span>
            </Link>
          )}
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="text-muted hover:text-foreground transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {persistedUnreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-0.5">
                  {persistedUnreadCount > 99 ? "99+" : persistedUnreadCount}
                </span>
              )}
            </button>
            {showNotifPanel && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifPanel(false)} />
                <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {persistedUnreadCount > 0 && (
                      <button
                        onClick={() => markAllNotificationsRead()}
                        className="text-xs text-accent hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {persistedNotifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-muted text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      persistedNotifications.map((notif) => {
                        const metadata = notif.metadata as Record<string, string> || {};
                        const newStatus = metadata.new_status;
                        const StatusIcon =
                          newStatus === "pending" ? Clock :
                          newStatus === "sold" ? CheckCircle :
                          newStatus === "archived" ? Archive :
                          newStatus === "active" ? RotateCcw :
                          Bell;
                        const iconColor =
                          newStatus === "pending" ? "text-warning" :
                          newStatus === "sold" ? "text-accent" :
                          newStatus === "archived" ? "text-muted" :
                          newStatus === "active" ? "text-success" :
                          "text-muted";

                        return (
                          <button
                            key={notif.id}
                            onClick={() => {
                              if (!notif.is_read) markNotificationRead(notif.id);
                              const slug = metadata.slug;
                              if (slug && newStatus !== "archived") {
                                window.location.href = `/deals/${slug}`;
                              }
                              setShowNotifPanel(false);
                            }}
                            className={`w-full text-left px-4 py-3 border-b border-border last:border-b-0 hover:bg-border/30 transition-colors flex items-start gap-3 ${
                              !notif.is_read ? "bg-accent/5" : ""
                            }`}
                          >
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              !notif.is_read ? "bg-accent/10" : "bg-border/50"
                            }`}>
                              <StatusIcon className={`w-4 h-4 ${iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notif.is_read ? "font-semibold" : "font-medium text-muted"}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-muted mt-0.5 line-clamp-2">{notif.message}</p>
                              <p className="text-xs text-muted/60 mt-1">
                                {formatTimeAgo(notif.created_at)}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <span className="shrink-0 w-2 h-2 rounded-full bg-accent mt-2" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
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
      {profileLoaded && isBuyer && (
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

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
