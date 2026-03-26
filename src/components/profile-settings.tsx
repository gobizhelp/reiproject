"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Profile, UserRole } from "@/lib/profile-types";
import {
  Building2, ShoppingCart, ArrowLeftRight, Loader2, Save, User, Phone, Briefcase
} from "lucide-react";
import ProBuyerBadge from "./pro-buyer-badge";

interface Props {
  profile: Profile | null;
  userEmail: string;
  userId: string;
}

export default function ProfileSettings({ profile, userEmail, userId }: Props) {
  const [userRole, setUserRole] = useState<UserRole>(profile?.user_role || "seller");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [companyName, setCompanyName] = useState(profile?.company_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);

    const supabase = createClient();

    const activeView = userRole === "buyer" ? "buyer"
      : userRole === "seller" ? "seller"
      : (profile?.active_view || "seller");

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        user_role: userRole,
        active_view: activeView,
        full_name: fullName || null,
        company_name: companyName || null,
        phone: phone || null,
      });

    if (error) {
      setError(error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
    router.refresh();
  }

  const roles: { value: UserRole; icon: React.ReactNode; title: string; description: string }[] = [
    {
      value: "seller",
      icon: <Building2 className="w-8 h-8" />,
      title: "Seller",
      description: "List and share off-market deals",
    },
    {
      value: "buyer",
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "Buyer",
      description: "Browse deals and set buy box criteria",
    },
    {
      value: "both",
      icon: <ArrowLeftRight className="w-8 h-8" />,
      title: "Both",
      description: "Sell deals and buy from wholesalers",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        {profile && (profile.user_role === "buyer" || profile.user_role === "both") && (
          <ProBuyerBadge buyerTier={profile.buyer_tier} size="md" />
        )}
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-success/10 border border-success/30 text-success rounded-lg px-4 py-3 text-sm mb-6">
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-8">
        {/* Account Info */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Email</label>
              <p className="text-foreground">{userEmail}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Your company (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </section>

        {/* Role Selection */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-2">Account Type</h2>
          <p className="text-muted text-sm mb-4">Choose how you want to use DealPacket</p>

          <div className="grid md:grid-cols-3 gap-3">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => setUserRole(role.value)}
                className={`flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all ${
                  userRole === role.value
                    ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                    : "border-border hover:border-muted"
                }`}
              >
                <div className={`mb-3 ${userRole === role.value ? "text-accent" : "text-muted"}`}>
                  {role.icon}
                </div>
                <h3 className="font-bold mb-1">{role.title}</h3>
                <p className="text-muted text-xs">{role.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
