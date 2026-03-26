'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Ban } from 'lucide-react';

export default function SuspendedPage() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center">
        <Ban className="w-12 h-12 text-danger mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Account Suspended</h1>
        <p className="text-muted mb-6">
          Your account has been suspended. If you believe this is an error,
          please contact support.
        </p>
        <button
          onClick={handleSignOut}
          className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
