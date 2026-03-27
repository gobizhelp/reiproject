"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/calculations";
import {
  MessageCircle, Eye, DollarSign, MessageSquare, Building2, MapPin, Clock,
  CheckCircle, User, Phone, Bed, Bath
} from "lucide-react";

interface PropertyData {
  id: string;
  slug: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  asking_price: number | null;
  property_type: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  property_photos: { id: string; url: string; display_order: number }[];
}

interface SenderProfile {
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
}

interface MessageRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  property_id: string;
  message_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  properties: PropertyData;
  sender?: SenderProfile;
}

interface Props {
  messages: MessageRow[];
  role: "buyer" | "seller";
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Eye; color: string }> = {
  request_showing: { label: "Showing Request", icon: Eye, color: "bg-accent/20 text-accent" },
  make_offer: { label: "Make Offer", icon: DollarSign, color: "bg-emerald-500/20 text-emerald-400" },
  ask_question: { label: "Question", icon: MessageSquare, color: "bg-orange-500/20 text-orange-400" },
};

type FilterType = "all" | "request_showing" | "make_offer" | "ask_question";

export default function MessagesView({ messages: initial, role }: Props) {
  const [messages, setMessages] = useState(initial);
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = filter === "all"
    ? messages
    : messages.filter((m) => m.message_type === filter);

  const unreadCount = messages.filter((m) => !m.is_read).length;

  async function markAsRead(messageId: string) {
    const res = await fetch("/api/listing-messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId }),
    });

    if (res.ok) {
      setMessages(messages.map((m) =>
        m.id === messageId ? { ...m, is_read: true } : m
      ));
    }
  }

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "request_showing", label: "Showings" },
    { key: "make_offer", label: "Offers" },
    { key: "ask_question", label: "Questions" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-accent" />
          {role === "seller" ? "Buyer Inquiries" : "My Messages"}
        </h1>
        <p className="text-muted mt-1">
          {role === "seller"
            ? `${unreadCount > 0 ? `${unreadCount} unread ` : ""}messages from interested buyers`
            : "Messages you've sent to sellers"}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-primary text-white"
                : "bg-card border border-border text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.key === "all" && messages.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({messages.length})</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <MessageCircle className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted text-lg mb-2">
            {messages.length === 0
              ? (role === "seller" ? "No buyer inquiries yet" : "No messages sent yet")
              : "No messages match this filter"}
          </p>
          {role === "seller" && messages.length === 0 && (
            <p className="text-muted text-sm">
              When buyers express interest in your properties, their messages will appear here.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((msg) => {
            const property = msg.properties;
            if (!property) return null;

            const photo = property.property_photos
              ?.sort((a, b) => a.display_order - b.display_order)?.[0];

            const typeConfig = TYPE_CONFIG[msg.message_type] || TYPE_CONFIG.ask_question;
            const TypeIcon = typeConfig.icon;

            return (
              <div
                key={msg.id}
                className={`bg-card border rounded-2xl overflow-hidden transition-colors ${
                  !msg.is_read && role === "seller"
                    ? "border-accent/50 bg-accent/5"
                    : "border-border"
                }`}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Property thumbnail */}
                  <Link
                    href={`/deals/${property.slug}`}
                    className="sm:w-48 shrink-0"
                  >
                    <div className="h-32 sm:h-full bg-background">
                      {photo ? (
                        <img
                          src={photo.url}
                          alt={property.street_address}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted">
                          <Building2 className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Message content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        {/* Message type badge */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeConfig.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Property info */}
                    <Link href={`/deals/${property.slug}`} className="block mb-2">
                      <h3 className="font-bold hover:text-accent transition-colors">
                        {property.street_address}
                      </h3>
                      <p className="text-muted text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {property.city}, {property.state} {property.zip_code}
                        {property.asking_price && (
                          <span className="ml-2 font-semibold text-accent">
                            {formatCurrency(property.asking_price)}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted mt-1">
                        {property.property_type && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {property.property_type}
                          </span>
                        )}
                        {property.beds != null && (
                          <span className="flex items-center gap-1">
                            <Bed className="w-3 h-3" />
                            {property.beds} bed
                          </span>
                        )}
                        {property.baths != null && (
                          <span className="flex items-center gap-1">
                            <Bath className="w-3 h-3" />
                            {property.baths} bath
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Message text */}
                    <p className="text-sm text-muted mb-3">{msg.message}</p>

                    {/* Sender info (seller view only) */}
                    {role === "seller" && msg.sender && (
                      <div className="flex items-center gap-4 text-sm text-muted pt-2 border-t border-border">
                        {msg.sender.full_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {msg.sender.full_name}
                          </span>
                        )}
                        {msg.sender.company_name && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {msg.sender.company_name}
                          </span>
                        )}
                        {msg.sender.phone && (
                          <a href={`tel:${msg.sender.phone}`} className="flex items-center gap-1 text-accent hover:underline">
                            <Phone className="w-3.5 h-3.5" />
                            {msg.sender.phone}
                          </a>
                        )}
                      </div>
                    )}

                    {/* Mark as read button (seller only) */}
                    {role === "seller" && !msg.is_read && (
                      <button
                        onClick={() => markAsRead(msg.id)}
                        className="mt-2 flex items-center gap-1.5 text-xs text-accent hover:underline"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mark as read
                      </button>
                    )}
                    {role === "seller" && msg.is_read && (
                      <span className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
