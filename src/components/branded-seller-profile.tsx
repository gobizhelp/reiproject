"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save, Upload, Globe, FileText, Image } from "lucide-react";

interface Props {
  profile: {
    logo_url: string | null;
    bio: string | null;
    website: string | null;
    company_name: string | null;
    full_name: string | null;
  };
  hasAccess: boolean;
}

export default function BrandedSellerProfile({ profile, hasAccess }: Props) {
  const [logoUrl, setLogoUrl] = useState(profile.logo_url || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [website, setWebsite] = useState(profile.website || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be under 2MB");
      return;
    }

    setUploading(true);
    setError("");
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `logos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("property-photos")
      .upload(path, file);

    if (uploadErr) {
      setError(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("property-photos")
      .getPublicUrl(path);

    setLogoUrl(publicUrl);
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/seller-branding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logo_url: logoUrl || null,
        bio: bio || null,
        website: website || null,
      }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save");
    }
    setSaving(false);
  }

  if (!hasAccess) {
    return (
      <section className="bg-card border border-border rounded-2xl p-6 opacity-60">
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-5 h-5 text-muted" />
          <h2 className="text-xl font-bold">Branded Profile</h2>
          <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-semibold">PRO</span>
        </div>
        <p className="text-muted text-sm">
          Upgrade to Pro to customize your seller profile with a logo, bio, and website.
          Your branding will appear on your listings.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Image className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-bold">Branded Profile</h2>
        <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-semibold">PRO</span>
      </div>
      <p className="text-muted text-sm mb-6">
        Customize your seller profile with branding. This appears on your listing pages.
      </p>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-success/10 border border-success/30 text-success rounded-lg px-4 py-3 text-sm mb-4">
          Branding saved!
        </div>
      )}

      <div className="space-y-4">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium mb-2">Company Logo</label>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-border" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-border/30 flex items-center justify-center text-muted">
                <Image className="w-6 h-6" />
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-border/50 hover:bg-border rounded-lg text-sm font-medium cursor-pointer transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? "Uploading..." : "Upload Logo"}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            {logoUrl && (
              <button
                onClick={() => setLogoUrl("")}
                className="text-sm text-muted hover:text-danger transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-muted mt-1">Max 2MB. Square images work best.</p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Bio / About
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            placeholder="Tell buyers about your company and experience..."
          />
          <p className="text-xs text-muted mt-1">{bio.length}/500</p>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Globe className="w-4 h-4 inline mr-1" />
            Website
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="https://yourcompany.com"
          />
        </div>

        {/* Preview */}
        {(logoUrl || profile.company_name || bio) && (
          <div className="border border-border rounded-xl p-4 bg-background/50">
            <p className="text-xs text-muted uppercase tracking-wide mb-3 font-medium">Preview</p>
            <div className="flex items-start gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent font-bold text-sm">
                    {(profile.company_name || profile.full_name || "S").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-sm">{profile.company_name || profile.full_name || "Your Name"}</p>
                {bio && <p className="text-muted text-xs mt-0.5 line-clamp-2">{bio}</p>}
                {website && (
                  <p className="text-accent text-xs mt-1 truncate">{website.replace(/^https?:\/\//, "")}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Branding
          </button>
        </div>
      </div>
    </section>
  );
}
