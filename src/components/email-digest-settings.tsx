"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { TIMEZONE_OPTIONS, HOUR_OPTIONS } from "@/lib/email-digest-types";
import { Mail, Loader2, Save, Clock, Globe, Send, AlertTriangle } from "lucide-react";

interface Props {
  userId: string;
}

export default function EmailDigestSettings({ userId }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [sendHour, setSendHour] = useState(8);
  const [timezone, setTimezone] = useState("America/New_York");
  const [lastSentAt, setLastSentAt] = useState<string | null>(null);
  const [hasBuyBoxes, setHasBuyBoxes] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      const supabase = createClient();
      try {
        const [settingsRes, buyBoxRes] = await Promise.all([
          fetch("/api/email-digest-settings"),
          supabase.from("buyer_buy_boxes").select("id", { count: "exact", head: true }).eq("user_id", userId),
        ]);
        if (settingsRes.ok) {
          const { settings } = await settingsRes.json();
          setEnabled(settings.enabled);
          setSendHour(settings.send_hour);
          setTimezone(settings.timezone);
          setLastSentAt(settings.last_sent_at ?? null);
        }
        setHasBuyBoxes((buyBoxRes.count ?? 0) > 0);
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [userId]);

  function isCooldownActive(): boolean {
    if (!lastSentAt) return false;
    const elapsed = Date.now() - new Date(lastSentAt).getTime();
    return elapsed < 24 * 60 * 60 * 1000;
  }

  function cooldownTimeLeft(): string {
    if (!lastSentAt) return "";
    const remaining = 24 * 60 * 60 * 1000 - (Date.now() - new Date(lastSentAt).getTime());
    if (remaining <= 0) return "";
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  }

  async function handleSendNow() {
    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/email-digest-settings/send-now", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send digest");
      }

      setLastSentAt(data.last_sent_at);
      setSendResult({ type: "success", message: `Digest sent with ${data.matches} matching listing${data.matches === 1 ? "" : "s"}.` });
      setTimeout(() => setSendResult(null), 5000);
    } catch (err) {
      setSendResult({ type: "error", message: err instanceof Error ? err.message : "Failed to send" });
    } finally {
      setSending(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/email-digest-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, send_hour: sendHour, timezone }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-accent" />
          <h2 className="text-xl font-bold">Daily Listing Digest</h2>
        </div>
        <div className="flex items-center gap-2 text-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading settings...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-bold">Daily Listing Digest</h2>
      </div>
      <p className="text-muted text-sm mb-6">
        Get a daily email summary of new listings that match your buy box criteria.
      </p>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-success/10 border border-success/30 text-success rounded-lg px-4 py-3 text-sm mb-4">
          Digest settings saved!
        </div>
      )}

      {sendResult && (
        <div className={`rounded-lg px-4 py-3 text-sm mb-4 ${
          sendResult.type === "success"
            ? "bg-success/10 border border-success/30 text-success"
            : "bg-danger/10 border border-danger/30 text-danger"
        }`}>
          {sendResult.message}
        </div>
      )}

      <div className="space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Enable daily digest</p>
            <p className="text-muted text-xs">Receive a daily email with matching deals</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Buy box warning */}
        {enabled && hasBuyBoxes === false && (
          <div className="flex items-start gap-3 bg-warning/10 border border-warning/30 text-warning rounded-lg px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              You need at least one buy box for the digest to match listings.{" "}
              <a href="/buyer/profile" className="underline font-medium">
                Add a buy box
              </a>
            </p>
          </div>
        )}

        {/* Time and timezone (shown when enabled) */}
        {enabled && (
          <div className="space-y-4 pt-2 border-t border-border">
            {/* Send time */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
                <Clock className="w-4 h-4 text-muted" />
                Send time
              </label>
              <select
                value={sendHour}
                onChange={(e) => setSendHour(parseInt(e.target.value, 10))}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                {HOUR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
                <Globe className="w-4 h-4 text-muted" />
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Send Now */}
        {enabled && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Send digest now</p>
                <p className="text-muted text-xs">
                  {isCooldownActive()
                    ? `Available again in ${cooldownTimeLeft()}`
                    : "Manually trigger your digest email"}
                </p>
              </div>
              <button
                onClick={handleSendNow}
                disabled={sending || isCooldownActive()}
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-colors"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Now
              </button>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Digest Settings
          </button>
        </div>
      </div>
    </section>
  );
}
