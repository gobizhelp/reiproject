"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/calculations";
import {
  MessageCircle, Eye, DollarSign, MessageSquare, Building2, MapPin, Clock, User
} from "lucide-react";
import ProBuyerBadge from "./pro-buyer-badge";
import type { Tier } from "@/lib/membership/tier-config";

interface ConversationRow {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  buyer_shared_contact: boolean;
  initial_action: string;
  created_at: string;
  updated_at: string;
  properties: {
    id: string;
    slug: string;
    street_address: string;
    city: string;
    state: string;
    zip_code: string;
    asking_price: number | null;
    property_photos: { id: string; url: string; display_order: number }[];
  };
  other_user: {
    id: string;
    full_name: string;
    company_name?: string;
    phone?: string;
    buyer_tier?: string;
  };
  last_message: {
    message: string;
    sender_id: string;
    created_at: string;
  } | null;
  unread_count: number;
  is_buyer: boolean;
}

interface Props {
  conversations: ConversationRow[];
  role: "buyer" | "seller";
}

const ACTION_CONFIG: Record<string, { label: string; icon: typeof Eye; color: string }> = {
  request_showing: { label: "Showing Request", icon: Eye, color: "bg-accent/20 text-accent" },
  make_offer: { label: "Offer", icon: DollarSign, color: "bg-emerald-500/20 text-emerald-400" },
  ask_question: { label: "Question", icon: MessageSquare, color: "bg-orange-500/20 text-orange-400" },
};

export default function ConversationsList({ conversations: initial, role }: Props) {
  const [conversations] = useState(initial);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-accent" />
          Messages
        </h1>
        <p className="text-muted mt-1">
          {role === "seller"
            ? `${totalUnread > 0 ? `${totalUnread} unread ` : ""}conversations with buyers`
            : "Your conversations with sellers"}
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <MessageCircle className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted text-lg mb-2">
            {role === "seller" ? "No conversations yet" : "No messages sent yet"}
          </p>
          {role === "seller" && (
            <p className="text-muted text-sm">
              When buyers express interest in your properties, their messages will appear here.
            </p>
          )}
          {role === "buyer" && (
            <p className="text-muted text-sm mb-6">
              Browse the marketplace and use the action buttons to start a conversation with sellers.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const property = conv.properties;
            if (!property) return null;

            const photo = property.property_photos
              ?.sort((a, b) => a.display_order - b.display_order)?.[0];

            const actionConfig = ACTION_CONFIG[conv.initial_action] || ACTION_CONFIG.ask_question;
            const ActionIcon = actionConfig.icon;

            const lastMsg = conv.last_message;
            const isUnread = conv.unread_count > 0;

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className={`block bg-card border rounded-2xl overflow-hidden transition-colors hover:border-accent/50 ${
                  isUnread ? "border-accent/50 bg-accent/5" : "border-border"
                }`}
              >
                <div className="flex items-center p-4 gap-4">
                  {/* Property thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-background shrink-0">
                    {photo ? (
                      <img src={photo.url} alt={property.street_address} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Conversation info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold truncate">
                        {conv.other_user.full_name}
                      </span>
                      {conv.is_buyer === false && conv.other_user.buyer_tier && (
                        <ProBuyerBadge buyerTier={conv.other_user.buyer_tier as Tier} />
                      )}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${actionConfig.color}`}>
                        <ActionIcon className="w-2.5 h-2.5" />
                        {actionConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted truncate">
                      {property.street_address}, {property.city} {property.state}
                      {property.asking_price ? ` - ${formatCurrency(property.asking_price)}` : ""}
                    </p>
                    {lastMsg && (
                      <p className={`text-sm truncate mt-1 ${isUnread ? "text-foreground font-medium" : "text-muted"}`}>
                        {lastMsg.message}
                      </p>
                    )}
                  </div>

                  {/* Right side: time + unread badge */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </span>
                    {isUnread && (
                      <span className="bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
