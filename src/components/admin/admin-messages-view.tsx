'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2, Eye, Home, Calendar, MessageCircle } from 'lucide-react';
import type { MessageType } from '@/lib/types';

interface AdminMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  property_id: string;
  message_type: MessageType;
  message: string;
  is_read: boolean;
  created_at: string;
  sender_name: string;
  recipient_name: string;
  property_address: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  request_showing: { label: 'Showing Request', color: 'text-blue-500 bg-blue-500/10' },
  make_offer: { label: 'Offer', color: 'text-green-500 bg-green-500/10' },
  ask_question: { label: 'Question', color: 'text-purple-500 bg-purple-500/10' },
};

type TypeFilter = 'all' | MessageType;

export default function AdminMessagesView() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    const res = await fetch('/api/admin/messages');
    if (res.ok) {
      setMessages(await res.json());
    }
    setLoading(false);
  }

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessages(messages.filter((m) => m.id !== id));
    }
  }

  const filtered = messages.filter((m) => {
    const matchesSearch =
      !search ||
      m.sender_name.toLowerCase().includes(search.toLowerCase()) ||
      m.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
      m.property_address.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'all' || m.message_type === typeFilter;
    const matchesRead =
      readFilter === 'all' ||
      (readFilter === 'read' && m.is_read) ||
      (readFilter === 'unread' && !m.is_read);

    return matchesSearch && matchesType && matchesRead;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-card rounded w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-card border border-border rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Message Oversight</h1>
        <span className="text-sm text-muted">{filtered.length} messages</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">All Types</option>
          <option value="request_showing">Showing Requests</option>
          <option value="make_offer">Offers</option>
          <option value="ask_question">Questions</option>
        </select>
        <select
          value={readFilter}
          onChange={(e) => setReadFilter(e.target.value as 'all' | 'read' | 'unread')}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {/* Messages */}
      <div className="space-y-2">
        {filtered.map((m) => {
          const config = TYPE_CONFIG[m.message_type] || { label: m.message_type, color: 'text-muted bg-muted/10' };
          const isExpanded = expandedId === m.id;

          return (
            <div key={m.id} className="border border-border rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-4 px-4 py-3 hover:bg-card-hover transition-colors cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : m.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.color}`}>
                      {config.label}
                    </span>
                    {!m.is_read && (
                      <span className="w-2 h-2 rounded-full bg-accent" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>
                      <span className="text-muted">From:</span> {m.sender_name}
                    </span>
                    <span>
                      <span className="text-muted">To:</span> {m.recipient_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted mt-1">
                    <Home className="w-3 h-3" />
                    {m.property_address}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(m.id);
                    }}
                    className="p-1.5 text-muted hover:text-danger transition-colors rounded-lg hover:bg-card"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 py-3 border-t border-border bg-card">
                  <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted text-sm">No messages found.</div>
        )}
      </div>
    </div>
  );
}
