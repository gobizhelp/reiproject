'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';

interface ImpersonationData {
  access_token: string;
  refresh_token: string;
  admin_user_id: string;
  target_name: string;
  target_email: string;
  target_role: string;
  started_at: string;
}

export default function ImpersonationBanner() {
  const router = useRouter();
  const [data, setData] = useState<ImpersonationData | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('admin_impersonation');
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        localStorage.removeItem('admin_impersonation');
      }
    }
  }, []);

  const switchBack = async () => {
    if (!data) return;
    setSwitching(true);

    try {
      const supabase = createClient();

      // Restore admin session using saved tokens
      const { error } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      if (error) {
        alert(`Failed to restore admin session: ${error.message}. Please log in again.`);
        localStorage.removeItem('admin_impersonation');
        router.push('/login');
        router.refresh();
        return;
      }

      localStorage.removeItem('admin_impersonation');
      router.push('/admin/demo');
      router.refresh();
    } catch (err: any) {
      alert(`Error switching back: ${err.message}`);
      setSwitching(false);
    }
  };

  if (!data) return null;

  return (
    <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-between z-50 relative">
      <div className="flex items-center gap-3">
        <Shield className="w-4 h-4" />
        <span className="text-sm font-medium">
          Impersonating: <strong>{data.target_name || data.target_email}</strong>
          <span className="ml-2 opacity-75">({data.target_role})</span>
        </span>
      </div>
      <button
        onClick={switchBack}
        disabled={switching}
        className="flex items-center gap-2 px-3 py-1 text-sm font-medium bg-white/20 hover:bg-white/30 rounded-md transition-colors disabled:opacity-50"
      >
        {switching ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Switching...</>
        ) : (
          <><ArrowLeft className="w-3.5 h-3.5" /> Back to Admin</>
        )}
      </button>
    </div>
  );
}
