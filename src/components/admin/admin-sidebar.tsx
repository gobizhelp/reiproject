'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  MessageCircle,
  BarChart3,
  ClipboardList,
  ArrowLeft,
  FlaskConical,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/properties', label: 'Properties', icon: Building2 },
  { href: '/admin/messages', label: 'Messages', icon: MessageCircle },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/activity', label: 'Activity Log', icon: ClipboardList },
  { href: '/admin/demo', label: 'Demo Environment', icon: FlaskConical },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-card min-h-[calc(100vh-65px)]">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-sm font-semibold text-orange-500 uppercase tracking-wide">
            Admin
          </span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(href, exact)
                  ? 'bg-orange-500/10 text-orange-500'
                  : 'text-muted hover:text-foreground hover:bg-card-hover'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Platform
        </Link>
      </div>
    </aside>
  );
}
