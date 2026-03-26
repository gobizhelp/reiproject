'use client';

import { useState } from 'react';
import {
  Play,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  Eye,
  EyeOff,
  Users,
  Building2,
  ShoppingCart,
  MessageCircle,
  Heart,
} from 'lucide-react';

interface DemoAccount {
  email: string;
  password: string;
  role: string;
  buyerTier: string;
  sellerTier: string;
}

interface SeedResult {
  success: boolean;
  results: string[];
  accounts?: DemoAccount[];
  error?: string;
}

function AccountCard({ account, showPasswords }: { account: DemoAccount; showPasswords: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const roleColors: Record<string, string> = {
    buyer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    seller: 'bg-green-500/10 text-green-400 border-green-500/20',
    both: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  const tierColors: Record<string, string> = {
    free: 'text-gray-400',
    pro: 'text-blue-400',
    elite: 'text-amber-400',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${roleColors[account.role] || ''}`}>
          {account.role.toUpperCase()}
        </span>
        <div className="flex items-center gap-2 text-xs">
          {account.role !== 'seller' && (
            <span className={tierColors[account.buyerTier]}>
              Buyer: {account.buyerTier}
            </span>
          )}
          {account.role !== 'buyer' && (
            <span className={tierColors[account.sellerTier]}>
              Seller: {account.sellerTier}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Email</span>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono">{account.email}</code>
            <button
              onClick={() => copyToClipboard(account.email, 'email')}
              className="text-muted hover:text-foreground transition-colors"
              title="Copy email"
            >
              {copied === 'email' ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Password</span>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono">
              {showPasswords ? account.password : '••••••••'}
            </code>
            <button
              onClick={() => copyToClipboard(account.password, 'password')}
              className="text-muted hover:text-foreground transition-colors"
              title="Copy password"
            >
              {copied === 'password' ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDemoManager() {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const seedDemo = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/demo', { method: 'POST' });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, results: [], error: err.message });
    }
    setLoading(false);
  };

  const clearDemo = async () => {
    if (!confirm('This will delete ALL demo accounts and their data. Continue?')) return;
    setDeleting(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/demo', { method: 'DELETE' });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, results: [], error: err.message });
    }
    setDeleting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Demo Environment</h1>
          <p className="text-sm text-muted mt-1">
            Create demo accounts with sample data for testing the platform
          </p>
        </div>
      </div>

      {/* What gets created */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">What gets created</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium">3 Demo Accounts</p>
              <p className="text-xs text-muted">Buyer (Pro), Seller (Pro), Both (Elite)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium">5 Properties</p>
              <p className="text-xs text-muted">4 published + 1 draft, various strategies</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShoppingCart className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium">4 Buy Boxes</p>
              <p className="text-xs text-muted">SFR flips, multi-family, wholesale, BRRRR</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium">3 Messages</p>
              <p className="text-xs text-muted">Questions, showing requests, offers</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Saved Listings</p>
              <p className="text-xs text-muted">Buyer has saved published properties</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={seedDemo}
          disabled={loading || deleting}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {loading ? 'Seeding...' : 'Seed Demo Data'}
        </button>
        <button
          onClick={clearDemo}
          disabled={loading || deleting}
          className="flex items-center gap-2 px-4 py-2.5 bg-danger/10 text-danger border border-danger/20 rounded-lg font-medium hover:bg-danger/20 transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {deleting ? 'Clearing...' : 'Clear Demo Data'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Status */}
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
            result.success
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {result.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="font-medium">
              {result.success ? 'Demo data operation completed' : `Error: ${result.error || 'Unknown error'}`}
            </span>
          </div>

          {/* Demo accounts */}
          {result.accounts && result.accounts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">Demo Accounts</h2>
                <button
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
                >
                  {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPasswords ? 'Hide' : 'Show'} passwords
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.accounts.map((account) => (
                  <AccountCard key={account.email} account={account} showPasswords={showPasswords} />
                ))}
              </div>
            </div>
          )}

          {/* Log */}
          {result.results.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Operation Log</h2>
              <div className="bg-card border border-border rounded-xl p-4 max-h-64 overflow-y-auto">
                <ul className="space-y-1">
                  {result.results.map((line, i) => (
                    <li key={i} className="text-sm font-mono text-muted">
                      <span className="text-foreground/40 mr-2">{i + 1}.</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
