'use client';

import { useEffect, useState } from 'react';
import {
  Search,
  Shield,
  ShieldOff,
  Ban,
  CheckCircle,
  ChevronDown,
  UserCog,
  Building2,
  MessageCircle,
} from 'lucide-react';
import type { UserWithDetails } from '@/lib/admin-types';

type RoleFilter = 'all' | 'seller' | 'buyer' | 'both';
type StatusFilter = 'all' | 'active' | 'suspended' | 'admin';

export default function AdminUserList() {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionModal, setActionModal] = useState<{
    type: 'role' | 'suspend' | 'admin';
    user: UserWithDetails;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      setUsers(await res.json());
    }
    setLoading(false);
  }

  async function handleAction(action: string, userId: string, data: Record<string, unknown> = {}) {
    setActionLoading(true);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, ...data }),
    });
    if (res.ok) {
      await fetchUsers();
      setActionModal(null);
      setSuspendReason('');
      setSelectedRole('');
    }
    setActionLoading(false);
  }

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.company_name?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.user_role === roleFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !u.is_suspended) ||
      (statusFilter === 'suspended' && u.is_suspended) ||
      (statusFilter === 'admin' && u.is_admin);

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-card rounded w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-card border border-border rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <span className="text-sm text-muted">{filtered.length} users</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">All Roles</option>
          <option value="seller">Sellers</option>
          <option value="buyer">Buyers</option>
          <option value="both">Both</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* User Table */}
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-card">
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 py-3">User</th>
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 py-3">Activity</th>
              <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 py-3">Joined</th>
              <th className="text-right text-xs font-semibold text-muted uppercase tracking-wide px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border hover:bg-card-hover transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{u.full_name || 'Unnamed'}</span>
                      {u.is_admin && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-500/10 text-orange-500 rounded">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">{u.email}</p>
                    {u.company_name && <p className="text-xs text-muted">{u.company_name}</p>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full capitalize">
                    {u.user_role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.is_suspended ? (
                    <span className="px-2 py-1 text-xs font-medium bg-danger/10 text-danger rounded-full">
                      Suspended
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-success/10 text-success rounded-full">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {u.property_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {u.message_count}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setSelectedRole(u.user_role);
                        setActionModal({ type: 'role', user: u });
                      }}
                      className="p-1.5 text-muted hover:text-foreground transition-colors rounded-lg hover:bg-card"
                      title="Change Role"
                    >
                      <UserCog className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAction('toggle_admin', u.id, { is_admin: !u.is_admin })}
                      className={`p-1.5 transition-colors rounded-lg hover:bg-card ${
                        u.is_admin ? 'text-orange-500 hover:text-orange-400' : 'text-muted hover:text-foreground'
                      }`}
                      title={u.is_admin ? 'Remove Admin' : 'Make Admin'}
                    >
                      {u.is_admin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </button>
                    {u.is_suspended ? (
                      <button
                        onClick={() => handleAction('activate', u.id)}
                        className="p-1.5 text-success hover:text-green-400 transition-colors rounded-lg hover:bg-card"
                        title="Activate User"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setActionModal({ type: 'suspend', user: u })}
                        className="p-1.5 text-muted hover:text-danger transition-colors rounded-lg hover:bg-card"
                        title="Suspend User"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted text-sm">No users found.</div>
        )}
      </div>

      {/* Action Modals */}
      {actionModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setActionModal(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              {actionModal.type === 'role' && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Change User Role</h3>
                  <p className="text-sm text-muted mb-4">
                    Changing role for {actionModal.user.full_name || actionModal.user.email}
                  </p>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-accent"
                  >
                    <option value="seller">Seller</option>
                    <option value="buyer">Buyer</option>
                    <option value="both">Both</option>
                  </select>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActionModal(null)}
                      className="flex-1 px-4 py-2 text-sm border border-border rounded-lg text-muted hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAction('update_role', actionModal.user.id, { user_role: selectedRole })}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 text-sm bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving...' : 'Update Role'}
                    </button>
                  </div>
                </>
              )}

              {actionModal.type === 'suspend' && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Suspend User</h3>
                  <p className="text-sm text-muted mb-4">
                    Suspending {actionModal.user.full_name || actionModal.user.email}. They will not be able to access the platform.
                  </p>
                  <textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="Reason for suspension (optional)..."
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mb-4 h-24 resize-none focus:outline-none focus:border-accent"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setActionModal(null);
                        setSuspendReason('');
                      }}
                      className="flex-1 px-4 py-2 text-sm border border-border rounded-lg text-muted hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        handleAction('suspend', actionModal.user.id, { reason: suspendReason })
                      }
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 text-sm bg-danger hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Suspending...' : 'Suspend User'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
