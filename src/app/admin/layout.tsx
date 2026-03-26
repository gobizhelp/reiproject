import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/admin-sidebar';
import Link from 'next/link';
import { Building2, Shield } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const adminSupabase = createAdminClient();
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-border bg-card">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <Building2 className="w-7 h-7 text-orange-500" />
              <span className="text-xl font-bold">DealPacket</span>
            </Link>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/20">
              <Shield className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-xs font-semibold text-orange-500 uppercase">Admin</span>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Back to Platform
          </Link>
        </div>
      </nav>
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
