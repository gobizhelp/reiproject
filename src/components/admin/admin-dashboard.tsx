'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  MessageCircle,
  TrendingUp,
  Star,
  AlertTriangle,
  Mail,
  FileText,
  UserPlus,
  Home,
} from 'lucide-react';
import type { AdminDashboardMetrics } from '@/lib/admin-types';

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}

function MetricCard({ label, value, icon, color = 'text-accent', subtitle }: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">{label}</p>
          <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
        </div>
        <div className={`${color}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        setMetrics(await res.json());
      }
      setLoading(false);
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-card rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-card border border-border rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return <p className="text-muted">Failed to load metrics.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Users"
            value={metrics.totalUsers}
            icon={<Users className="w-5 h-5" />}
            subtitle={`+${metrics.newUsersLast7Days} this week`}
          />
          <MetricCard
            label="Sellers"
            value={metrics.totalSellers}
            icon={<Building2 className="w-5 h-5" />}
            color="text-blue-500"
          />
          <MetricCard
            label="Buyers"
            value={metrics.totalBuyers}
            icon={<UserPlus className="w-5 h-5" />}
            color="text-green-500"
          />
          <MetricCard
            label="Both Roles"
            value={metrics.totalBothUsers}
            icon={<Users className="w-5 h-5" />}
            color="text-purple-500"
          />
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Properties"
            value={metrics.totalProperties}
            icon={<Home className="w-5 h-5" />}
            subtitle={`+${metrics.newPropertiesLast7Days} this week`}
          />
          <MetricCard
            label="Published"
            value={metrics.publishedProperties}
            icon={<FileText className="w-5 h-5" />}
            color="text-green-500"
          />
          <MetricCard
            label="Featured"
            value={metrics.featuredProperties}
            icon={<Star className="w-5 h-5" />}
            color="text-yellow-500"
          />
          <MetricCard
            label="Flagged"
            value={metrics.flaggedProperties}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="text-danger"
          />
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Engagement</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Messages"
            value={metrics.totalMessages}
            icon={<MessageCircle className="w-5 h-5" />}
          />
          <MetricCard
            label="Unread Messages"
            value={metrics.unreadMessages}
            icon={<Mail className="w-5 h-5" />}
            color="text-orange-500"
          />
          <MetricCard
            label="Buy Box Submissions"
            value={metrics.totalBuyBoxSubmissions}
            icon={<FileText className="w-5 h-5" />}
            color="text-purple-500"
          />
          <MetricCard
            label="New Users (30d)"
            value={metrics.newUsersLast30Days}
            icon={<TrendingUp className="w-5 h-5" />}
            color="text-green-500"
          />
        </div>
      </div>
    </div>
  );
}
