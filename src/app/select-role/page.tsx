"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingCart, ArrowLeftRight, Building2 } from "lucide-react";
import Image from "next/image";
import type { UserRole } from "@/lib/profile-types";

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // If user already selected a role, redirect them away
    async function checkRole() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role_selected")
        .eq("id", user.id)
        .single();
      if (profile?.role_selected) {
        router.push("/dashboard");
        return;
      }
      setChecking(false);
    }
    checkRole();
  }, [router]);

  async function handleRoleSelect() {
    if (!selectedRole) return;
    setSaving(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expired. Please log in again.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        user_role: selectedRole,
        active_view: selectedRole === "buyer" ? "buyer" : "seller",
        role_selected: true,
      })
      .eq("id", user.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    if (selectedRole === "buyer") {
      router.push("/marketplace");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  const roles: { value: UserRole; icon: React.ReactNode; title: string; description: string }[] = [
    {
      value: "seller",
      icon: <Building2 className="w-10 h-10" />,
      title: "Seller",
      description: "List and share off-market deals with investors",
    },
    {
      value: "buyer",
      icon: <ShoppingCart className="w-10 h-10" />,
      title: "Buyer",
      description: "Browse deals and set your buy box criteria",
    },
    {
      value: "both",
      icon: <ArrowLeftRight className="w-10 h-10" />,
      title: "Both",
      description: "Sell your deals and buy from other wholesalers",
    },
  ];

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Image src="/logo.svg" alt="REI Reach" width={40} height={40} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">How will you use REI Reach?</h1>
          <p className="text-muted">Choose your role to get started. You can change this anytime in settings.</p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={`flex flex-col items-center text-center p-8 rounded-2xl border-2 transition-all ${
                selectedRole === role.value
                  ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                  : "border-border bg-card hover:border-muted"
              }`}
            >
              <div className={`mb-4 ${selectedRole === role.value ? "text-accent" : "text-muted"}`}>
                {role.icon}
              </div>
              <h2 className="text-xl font-bold mb-2">{role.title}</h2>
              <p className="text-muted text-sm">{role.description}</p>
            </button>
          ))}
        </div>

        <button
          onClick={handleRoleSelect}
          disabled={!selectedRole || saving}
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          Continue
        </button>
      </div>
    </div>
  );
}
