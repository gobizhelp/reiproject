"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { playDMSound, playNotificationSound } from "@/lib/notification-sounds";
import { MessageCircle, X, Bell, Home } from "lucide-react";
import type { AppNotification } from "@/lib/types";

interface ToastNotification {
  id: string;
  type: "dm" | "general" | "listing_update";
  title: string;
  message: string;
  conversationId?: string;
  propertyId?: string;
  timestamp: number;
}

interface NotificationContextValue {
  unreadCount: number;
  notifications: ToastNotification[];
  persistedNotifications: AppNotification[];
  persistedUnreadCount: number;
  clearNotification: (id: string) => void;
  clearAll: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  notifications: [],
  persistedNotifications: [],
  persistedUnreadCount: 0,
  clearNotification: () => {},
  clearAll: () => {},
  soundEnabled: true,
  toggleSound: () => {},
  markNotificationRead: () => {},
  markAllNotificationsRead: () => {},
  refreshNotifications: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [persistedNotifications, setPersistedNotifications] = useState<AppNotification[]>([]);
  const [persistedUnreadCount, setPersistedUnreadCount] = useState(0);
  const supabaseRef = useRef(createClient());

  // Load sound preference from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("notification_sound_enabled");
    if (stored !== null) {
      setSoundEnabled(stored === "true");
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("notification_sound_enabled", String(next));
      return next;
    });
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setToasts((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setToasts([]);
  }, []);

  // Fetch persisted notifications from API
  const refreshNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch("/api/notifications?limit=50");
      if (res.ok) {
        const data = await res.json();
        setPersistedNotifications(data);
        setPersistedUnreadCount(data.filter((n: AppNotification) => !n.is_read).length);
      }
    } catch {
      // silently fail
    }
  }, [userId]);

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: id }),
      });
      setPersistedNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
      setPersistedUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_all_read: true }),
      });
      setPersistedNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setPersistedUnreadCount(0);
    } catch {
      // silently fail
    }
  }, []);

  // Get the current user
  useEffect(() => {
    const supabase = supabaseRef.current;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Fetch initial unread count (messages) and persisted notifications
  useEffect(() => {
    if (!userId) return;
    const supabase = supabaseRef.current;

    async function fetchUnread() {
      const { count } = await supabase
        .from("conversation_messages")
        .select("id", { count: "exact", head: true })
        .neq("sender_id", userId)
        .eq("is_read", false);

      setUnreadCount(count || 0);
    }

    fetchUnread();
    refreshNotifications();
  }, [userId, refreshNotifications]);

  // Subscribe to real-time conversation messages + notifications table
  useEffect(() => {
    if (!userId) return;
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel("dm-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_messages",
        },
        (payload) => {
          const msg = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            message: string;
            created_at: string;
          };

          if (msg.sender_id === userId) return;

          setUnreadCount((prev) => prev + 1);

          const notification: ToastNotification = {
            id: msg.id,
            type: "dm",
            title: "New Message",
            message: msg.message.length > 80 ? msg.message.slice(0, 80) + "..." : msg.message,
            conversationId: msg.conversation_id,
            timestamp: Date.now(),
          };

          setNotifications((prev) => [notification, ...prev].slice(0, 50));
          setToasts((prev) => [notification, ...prev].slice(0, 3));

          if (soundEnabled) {
            playDMSound();
          }

          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== notification.id));
          }, 5000);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "listing_messages",
        },
        (payload) => {
          const msg = payload.new as {
            id: string;
            recipient_id: string;
            sender_id: string;
            message: string;
            message_type: string;
          };

          if (msg.recipient_id !== userId) return;

          const notification: ToastNotification = {
            id: msg.id,
            type: "general",
            title: msg.message_type === "make_offer" ? "New Offer" :
                   msg.message_type === "request_showing" ? "Showing Request" : "New Inquiry",
            message: msg.message.length > 80 ? msg.message.slice(0, 80) + "..." : msg.message,
            timestamp: Date.now(),
          };

          setNotifications((prev) => [notification, ...prev].slice(0, 50));
          setToasts((prev) => [notification, ...prev].slice(0, 3));

          if (soundEnabled) {
            playNotificationSound();
          }

          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== notification.id));
          }, 5000);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notif = payload.new as AppNotification;

          // Add to persisted notifications list
          setPersistedNotifications((prev) => [notif, ...prev].slice(0, 50));
          setPersistedUnreadCount((prev) => prev + 1);

          // Show toast for listing status changes
          const toast: ToastNotification = {
            id: notif.id,
            type: "listing_update",
            title: notif.title,
            message: notif.message.length > 80 ? notif.message.slice(0, 80) + "..." : notif.message,
            propertyId: notif.property_id || undefined,
            timestamp: Date.now(),
          };

          setToasts((prev) => [toast, ...prev].slice(0, 3));

          if (soundEnabled && notif.priority === "high") {
            playNotificationSound();
          }

          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          }, 5000);
        }
      )
      .subscribe();

    // Also listen for when messages are marked as read to decrement count
    const readChannel = supabase
      .channel("read-tracking")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_messages",
        },
        (payload) => {
          const msg = payload.new as { sender_id: string; is_read: boolean };
          const old = payload.old as { is_read: boolean };
          if (msg.sender_id !== userId && !old.is_read && msg.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(readChannel);
    };
  }, [userId, soundEnabled]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        persistedNotifications,
        persistedUnreadCount,
        clearNotification,
        clearAll,
        soundEnabled,
        toggleSound,
        markNotificationRead,
        markAllNotificationsRead,
        refreshNotifications,
      }}
    >
      {children}

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-card border border-border rounded-xl shadow-lg p-4 max-w-sm animate-slide-in flex items-start gap-3"
          >
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              toast.type === "dm" ? "bg-accent/20 text-accent" :
              toast.type === "listing_update" ? "bg-warning/20 text-warning" :
              "bg-orange-500/20 text-orange-400"
            }`}>
              {toast.type === "dm" ? (
                <MessageCircle className="w-4 h-4" />
              ) : toast.type === "listing_update" ? (
                <Home className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{toast.title}</p>
              <p className="text-xs text-muted mt-0.5 truncate">{toast.message}</p>
            </div>
            <button
              onClick={() => clearNotification(toast.id)}
              className="shrink-0 text-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
