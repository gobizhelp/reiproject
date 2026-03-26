"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/calculations";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft, Send, Building2, MapPin, Eye, DollarSign, MessageSquare,
  Phone, Mail, User, Share2, CheckCircle
} from "lucide-react";
import ProBuyerBadge from "./pro-buyer-badge";
import type { Tier } from "@/lib/membership/tier-config";

interface PropertyData {
  id: string;
  slug: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  asking_price: number | null;
  property_photos: { id: string; url: string; display_order: number }[];
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ConversationData {
  id: string;
  buyer_id: string;
  seller_id: string;
  buyer_shared_contact: boolean;
  initial_action: string;
  property: PropertyData;
}

interface OtherUser {
  id: string;
  full_name: string;
  company_name?: string;
  phone?: string;
  buyer_tier?: string;
}

interface Props {
  conversation: ConversationData;
  messages: MessageRow[];
  isBuyer: boolean;
  currentUserId: string;
  otherUser: OtherUser;
  contactShared: boolean;
}

const ACTION_LABELS: Record<string, { label: string; icon: typeof Eye }> = {
  request_showing: { label: "Showing Request", icon: Eye },
  make_offer: { label: "Offer Discussion", icon: DollarSign },
  ask_question: { label: "Question", icon: MessageSquare },
};

export default function ConversationView({
  conversation,
  messages: initialMessages,
  isBuyer,
  currentUserId,
  otherUser,
  contactShared: initialContactShared,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [contactShared, setContactShared] = useState(initialContactShared);
  const [sharingContact, setSharingContact] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const property = conversation.property;
  const photo = property?.property_photos?.sort((a, b) => a.display_order - b.display_order)?.[0];
  const actionInfo = ACTION_LABELS[conversation.initial_action] || ACTION_LABELS.ask_question;
  const ActionIcon = actionInfo.icon;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read on mount
  useEffect(() => {
    fetch("/api/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: conversation.id, action: "mark_read" }),
    });
  }, [conversation.id]);

  // Real-time: subscribe to new messages in this conversation
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conversation-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversation_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageRow;
          // Skip if it's our own message (already handled by optimistic update)
          if (newMsg.sender_id === currentUserId) return;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // Mark as read since we're viewing this conversation
          fetch("/api/conversations", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId: conversation.id, action: "mark_read" }),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, currentUserId]);

  async function handleSend() {
    if (!newMessage.trim() || sending) return;
    setSending(true);

    const optimisticMsg: MessageRow = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
      sender_id: currentUserId,
      message: newMessage.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, optimisticMsg]);
    setNewMessage("");

    const res = await fetch("/api/conversations/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: conversation.id, message: newMessage.trim() }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? data.message : m))
      );
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    }

    setSending(false);
  }

  async function handleShareContact() {
    setSharingContact(true);
    const res = await fetch("/api/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: conversation.id, action: "share_contact" }),
    });
    if (res.ok) {
      setContactShared(true);
    }
    setSharingContact(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-4 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/messages" className="text-muted hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg truncate">{otherUser.full_name}</h1>
              {!isBuyer && otherUser.buyer_tier && (
                <ProBuyerBadge buyerTier={otherUser.buyer_tier as Tier} size="md" />
              )}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/20 text-accent shrink-0">
                <ActionIcon className="w-2.5 h-2.5" />
                {actionInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Property info */}
        {property && (
          <Link href={`/deals/${property.slug}`} className="flex items-center gap-3 p-2 rounded-lg bg-background hover:bg-background/80 transition-colors">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-card shrink-0">
              {photo ? (
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">
                  <Building2 className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{property.street_address}</p>
              <p className="text-xs text-muted flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {property.city}, {property.state} {property.zip_code}
                {property.asking_price ? ` - ${formatCurrency(property.asking_price)}` : ""}
              </p>
            </div>
          </Link>
        )}

        {/* Contact details (only shown when buyer has shared) */}
        {contactShared && otherUser.phone && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-sm">
            <span className="flex items-center gap-1.5 text-muted">
              <User className="w-3.5 h-3.5" />
              {otherUser.full_name}
            </span>
            {otherUser.company_name && (
              <span className="flex items-center gap-1.5 text-muted">
                <Building2 className="w-3.5 h-3.5" />
                {otherUser.company_name}
              </span>
            )}
            {otherUser.phone && (
              <a href={`tel:${otherUser.phone}`} className="flex items-center gap-1.5 text-accent hover:underline">
                <Phone className="w-3.5 h-3.5" />
                {otherUser.phone}
              </a>
            )}
          </div>
        )}

        {/* Share contact button (buyer only, when not yet shared) */}
        {isBuyer && !contactShared && (
          <button
            onClick={handleShareContact}
            disabled={sharingContact}
            className="mt-3 w-full flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-colors disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            {sharingContact ? "Sharing..." : "Share My Contact Details"}
          </button>
        )}

        {/* Contact shared confirmation */}
        {isBuyer && contactShared && (
          <div className="mt-3 flex items-center gap-2 text-xs text-success">
            <CheckCircle className="w-3.5 h-3.5" />
            Contact details shared with this seller
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe
                    ? "bg-accent text-white rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <p className={`text-[10px] mt-1 ${isMe ? "text-white/60" : "text-muted"}`}>
                  {new Date(msg.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="bg-card border border-border rounded-2xl p-3 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
