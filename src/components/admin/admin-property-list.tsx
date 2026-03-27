'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Star,
  StarOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '@/lib/calculations';

interface AdminProperty {
  id: string;
  slug: string;
  status: string;
  title: string | null;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string;
  asking_price: number | null;
  is_featured: boolean;
  moderation_status: string;
  moderation_note: string | null;
  created_at: string;
  owner_name: string;
  owner_company: string | null;
  thumbnail: string | null;
}

type ModerationFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'flagged';
type StatusFilter = 'all' | 'draft' | 'published';

export default function AdminPropertyList() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moderationFilter, setModerationFilter] = useState<ModerationFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [moderateModal, setModerateModal] = useState<AdminProperty | null>(null);
  const [moderationStatus, setModerationStatus] = useState('');
  const [moderationNote, setModerationNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    const res = await fetch('/api/admin/properties');
    if (res.ok) {
      setProperties(await res.json());
    }
    setLoading(false);
  }

  async function toggleFeatured(propertyId: string, featured: boolean) {
    await fetch('/api/admin/properties', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, action: 'feature', is_featured: featured }),
    });
    await fetchProperties();
  }

  async function handleModerate() {
    if (!moderateModal) return;
    setActionLoading(true);
    await fetch('/api/admin/properties', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: moderateModal.id,
        action: 'moderate',
        moderation_status: moderationStatus,
        moderation_note: moderationNote,
      }),
    });
    setModerateModal(null);
    setModerationNote('');
    setActionLoading(false);
    await fetchProperties();
  }

  const filtered = properties.filter((p) => {
    const matchesSearch =
      !search ||
      p.street_address.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.state.toLowerCase().includes(search.toLowerCase()) ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.owner_name.toLowerCase().includes(search.toLowerCase());

    const matchesModeration = moderationFilter === 'all' || p.moderation_status === moderationFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesFeatured = !featuredOnly || p.is_featured;

    return matchesSearch && matchesModeration && matchesStatus && matchesFeatured;
  });

  const moderationBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: 'bg-success/10 text-success',
      pending: 'bg-yellow-500/10 text-yellow-500',
      flagged: 'bg-orange-500/10 text-orange-500',
      rejected: 'bg-danger/10 text-danger',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${styles[status] || 'bg-muted/10 text-muted'}`}>
        {status}
      </span>
    );
  };

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
        <h1 className="text-2xl font-bold">Property Management</h1>
        <span className="text-sm text-muted">{filtered.length} properties</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by address, city, title, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={moderationFilter}
          onChange={(e) => setModerationFilter(e.target.value as ModerationFilter)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">All Moderation</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="flagged">Flagged</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={() => setFeaturedOnly(!featuredOnly)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${
            featuredOnly ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-border text-muted hover:text-foreground'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          Featured
        </button>
      </div>

      {/* Property Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-card">
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 py-3">Property</th>
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 py-3">Owner</th>
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 py-3">Price</th>
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 py-3">Moderation</th>
              <th className="text-right text-xs font-semibold text-muted uppercase tracking-wide px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border hover:bg-card-hover transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.thumbnail && (
                      <img
                        src={p.thumbnail}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {p.title || p.street_address}
                        </span>
                        {p.is_featured && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <p className="text-xs text-muted">
                        {p.city}, {p.state} {p.zip_code}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm">{p.owner_name}</p>
                  {p.owner_company && <p className="text-xs text-muted">{p.owner_company}</p>}
                </td>
                <td className="px-4 py-3 text-sm">
                  {p.asking_price ? formatCurrency(p.asking_price) : '-'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                      p.status === 'published' ? 'bg-success/10 text-success' : 'bg-muted/20 text-muted'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">{moderationBadge(p.moderation_status)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {p.status === 'published' && (
                      <a
                        href={`/deals/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-card"
                        title="View Deal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => toggleFeatured(p.id, !p.is_featured)}
                      className={`p-1.5 transition-colors rounded-lg hover:bg-card ${
                        p.is_featured ? 'text-yellow-500' : 'text-muted hover:text-foreground'
                      }`}
                      title={p.is_featured ? 'Unfeature' : 'Feature'}
                    >
                      {p.is_featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setModerationStatus(p.moderation_status);
                        setModerationNote(p.moderation_note || '');
                        setModerateModal(p);
                      }}
                      className="p-1.5 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-card"
                      title="Moderate"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted text-sm">No properties found.</div>
        )}
      </div>

      {/* Moderation Modal */}
      {moderateModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setModerateModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-2">Moderate Property</h3>
              <p className="text-sm text-muted mb-4">
                {moderateModal.title || moderateModal.street_address}, {moderateModal.city}
              </p>
              <label className="block text-sm font-medium mb-2">Moderation Status</label>
              <div className="flex gap-2 mb-4">
                {['approved', 'pending', 'flagged', 'rejected'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setModerationStatus(s)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors capitalize ${
                      moderationStatus === s
                        ? s === 'approved'
                          ? 'border-success bg-success/10 text-success'
                          : s === 'flagged'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                          : s === 'rejected'
                          ? 'border-danger bg-danger/10 text-danger'
                          : 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                        : 'border-border text-muted hover:text-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <label className="block text-sm font-medium mb-2">Note (optional)</label>
              <textarea
                value={moderationNote}
                onChange={(e) => setModerationNote(e.target.value)}
                placeholder="Reason for moderation decision..."
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mb-4 h-24 resize-none focus:outline-none focus:border-accent"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setModerateModal(null)}
                  className="flex-1 px-4 py-2 text-sm border border-border rounded-lg text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModerate}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 text-sm bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
