"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { playDMSound, playNotificationSound } from "@/lib/notification-sounds";
import { MessageCircle, X, Bell } from "lucide-react";

interface Notification {
  id: string;
  type: "dm" | "general";
  title: string;
  message: string;
  conversationId?: string;
  timestamp: number;
}

interface NotificationContextValue {
  unreadCount: number;
  notifications: Notification[];
  clearNotification: (id: string) => void;
  clearAll: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  notifications: [],
  clearNotification: () => {},
  clearAll: () => {},
  soundEnabled: true,
  toggleSound: () => {},
});

export function useNotifications() {
  return useContext(NotificationContext);
}

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toasts, setToasts] = useState<Notification[]>([]);
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

  // Get the current user
  useEffect(() => {
    const supabase = supabaseRef.current;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Fetch initial unread count
  useEffect(() => {
    if (!userId) return;
    const supabase = supabaseRef.current;

    async function fetchUnread() {
      // Count unread conversation messages
      const { count } = await supabase
        .from("conversation_messages")
        .select("id", { count: "exact", head: true })
        .neq("sender_id", userId)
        .eq("is_read", false);

      setUnreadCount(count || 0);
    }

    fetchUnread();
  }, [userId]);

  // Subscribe to real-time conversation messages
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

          // Ignore own messages
          if (msg.sender_id === userId) return;

          // Increment unread count
          setUnreadCount((prev) => prev + 1);

          // Create notification
          const notification: Notification = {
            id: msg.id,
            type: "dm",
            title: "New Message",
            message: msg.message.length > 80 ? msg.message.slice(0, 80) + "..." : msg.message,
            conversationId: msg.conversation_id,
            timestamp: Date.now(),
          };

          setNotifications((prev) => [notification, ...prev].slice(0, 50));
          setToasts((prev) => [notification, ...prev].slice(0, 3));

          // Play DM sound
          if (soundEnabled) {
            playDMSound();
          }

          // Auto-dismiss toast after 5 seconds
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

          // Only notify the recipient
          if (msg.recipient_id !== userId) return;

          const notification: Notification = {
            id: msg.id,
            type: "general",
            title: msg.message_type === "make_offer" ? "New Offer" :
                   msg.message_type === "request_showing" ? "Showing Request" : "New Inquiry",
            message: msg.message.length > 80 ? msg.message.slice(0, 80) + "..." : msg.message,
            timestamp: Date.now(),
          };

          setNotifications((prev) => [notification, ...prev].slice(0, 50));
          setToasts((prev) => [notification, ...prev].slice(0, 3));

          // Play general notification sound
          if (soundEnabled) {
            playNotificationSound();
          }

          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== notification.id));
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
          // If a message sent by someone else was just marked as read
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
      value={{ unreadCount, notifications, clearNotification, clearAll, soundEnabled, toggleSound }}
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
              toast.type === "dm" ? "bg-accent/20 text-accent" : "bg-orange-500/20 text-orange-400"
            }`}>
              {toast.type === "dm" ? (
                <MessageCircle className="w-4 h-4" />
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
