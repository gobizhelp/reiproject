'use client';

import { useEffect, useState } from 'react';
import { Settings, Save, Clock, Crown } from 'lucide-react';

const DEFAULT_EARLY_ACCESS_HOURS = 24;

export default function AdminSettings() {
  const [earlyAccessHours, setEarlyAccessHours] = useState<number>(DEFAULT_EARLY_ACCESS_HOURS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.elite_early_access_hours != null) {
          setEarlyAccessHours(data.elite_early_access_hours);
        }
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'elite_early_access_hours', value: earlyAccessHours }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Platform Settings
        </h1>
        <p className="text-muted mt-1">Configure platform-wide settings</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Elite Early Access Section */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Elite Buyer Early Access</h2>
              <p className="text-muted text-sm mt-0.5">
                Elite-tier buyers get exclusive early access to new listings before they become
                visible to Pro and Free buyers. Set the duration of this early access window.
              </p>
            </div>
          </div>

          <div className="bg-background border border-border rounded-xl p-4">
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted" />
              Early Access Duration
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={168}
                value={earlyAccessHours}
                onChange={(e) => setEarlyAccessHours(Math.max(0, Math.min(168, parseInt(e.target.value) || 0)))}
                className="w-24 bg-card border border-border rounded-lg px-3 py-2 text-foreground text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <span className="text-muted text-sm">hours</span>
            </div>
            <p className="text-xs text-muted mt-2">
              Set to <span className="font-mono">0</span> to disable early access. Max 168 hours (7 days).
            </p>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: 'Off', value: 0 },
                { label: '6h', value: 6 },
                { label: '12h', value: 12 },
                { label: '24h', value: 24 },
                { label: '48h', value: 48 },
                { label: '72h', value: 72 },
              ].map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setEarlyAccessHours(preset.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    earlyAccessHours === preset.value
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted hover:text-foreground hover:border-muted'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {saved && (
              <span className="text-sm text-success font-medium">Settings saved</span>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
          <h3 className="font-medium text-amber-400 text-sm mb-2">How Early Access Works</h3>
          <ul className="text-sm text-muted space-y-1.5">
            <li>When a seller publishes a new listing, Elite buyers can see it immediately.</li>
            <li>Pro and Free buyers will only see the listing after the early access window expires.</li>
            <li>The timer starts from the moment the listing is first published.</li>
            <li>Changing this setting applies to all future and currently active early access windows.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
