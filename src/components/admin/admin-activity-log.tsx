'use client';

import { useEffect, useState } from 'react';
import {
  Shield,
  Ban,
  CheckCircle,
  Star,
  AlertTriangle,
  Trash2,
  UserCog,
  Clock,
} from 'lucide-react';
import type { AdminActivityLog } from '@/lib/admin-types';

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  update_role: { label: 'Changed Role', icon: <UserCog className="w-4 h-4" />, color: 'text-blue-500' },
  toggle_admin: { label: 'Toggled Admin', icon: <Shield className="w-4 h-4" />, color: 'text-orange-500' },
  suspend: { label: 'Suspended User', icon: <Ban className="w-4 h-4" />, color: 'text-danger' },
  activate: { label: 'Activated User', icon: <CheckCircle className="w-4 h-4" />, color: 'text-success' },
  feature_property: { label: 'Featured Property', icon: <Star className="w-4 h-4" />, color: 'text-yellow-500' },
  unfeature_property: { label: 'Unfeatured Property', icon: <Star className="w-4 h-4" />, color: 'text-muted' },
  approved_property: { label: 'Approved Property', icon: <CheckCircle className="w-4 h-4" />, color: 'text-success' },
  flagged_property: { label: 'Flagged Property', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-orange-500' },
  rejected_property: { label: 'Rejected Property', icon: <Ban className="w-4 h-4" />, color: 'text-danger' },
  pending_property: { label: 'Set Pending', icon: <Clock className="w-4 h-4" />, color: 'text-yellow-500' },
  delete_message: { label: 'Deleted Message', icon: <Trash2 className="w-4 h-4" />, color: 'text-danger' },
};

export default function AdminActivityLogView() {
  const [logs, setLogs] = useState<AdminActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchLogs() {
      const res = await fetch('/api/admin/activity');
      if (res.ok) {
        setLogs(await res.json());
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.target_type === filter);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-card rounded w-48" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 bg-card border border-border rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">All Actions</option>
          <option value="user">User Actions</option>
          <option value="property">Property Actions</option>
          <option value="message">Message Actions</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((log) => {
          const config = ACTION_CONFIG[log.action] || {
            label: log.action,
            icon: <Clock className="w-4 h-4" />,
            color: 'text-muted',
          };

          return (
            <div
              key={log.id}
              className="flex items-center gap-4 px-4 py-3 border border-border rounded-xl hover:bg-card-hover transition-colors"
            >
              <div className={`${config.color}`}>{config.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{log.admin_name}</span>{' '}
                  <span className="text-muted">{config.label.toLowerCase()}</span>
                </p>
                {log.details && Object.keys(log.details).length > 0 && (
                  <p className="text-xs text-muted mt-0.5">
                    {Object.entries(log.details)
                      .filter(([, v]) => v !== null && v !== undefined)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' | ')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 text-[10px] font-medium bg-card border border-border rounded-full capitalize">
                  {log.target_type}
                </span>
                <span className="text-xs text-muted">
                  {new Date(log.created_at).toLocaleDateString()}{' '}
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted text-sm">No activity logged yet.</div>
        )}
      </div>
    </div>
  );
}
