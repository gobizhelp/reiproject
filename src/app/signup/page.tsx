"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Loader2, ShoppingCart, ArrowLeftRight } from "lucide-react";
import type { UserRole } from "@/lib/profile-types";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [step, setStep] = useState<"credentials" | "role">("credentials");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error, data } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      // Email confirmation is disabled — user is immediately logged in
      // Show role selection step
      setStep("role");
      setLoading(false);
    } else {
      // Email confirmation required — show message
      setEmailSent(true);
      setLoading(false);
    }
  }

  async function handleRoleSelect() {
    if (!selectedRole) return;
    setSavingRole(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expired. Please log in again.");
      setSavingRole(false);
      return;
    }

    // Upsert profile with selected role
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        user_role: selectedRole,
        active_view: selectedRole === "buyer" ? "buyer" : "seller",
        role_selected: true,
      });

    if (error) {
      setError(error.message);
      setSavingRole(false);
      return;
    }

    // Redirect based on role
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

  // Role selection step
  if (step === "role") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <Building2 className="w-10 h-10 text-accent mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">How will you use REI Reach?</h1>
            <p className="text-muted">You can change this anytime in your profile settings</p>
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
            disabled={!selectedRole || savingRole}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
          >
            {savingRole && <Loader2 className="w-5 h-5 animate-spin" />}
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Building2 className="w-8 h-8 text-accent" />
            <span className="text-2xl font-bold">REI Reach</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-muted">Start sharing professional deal packets</p>
        </div>

        {emailSent ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-6 mb-4">
              <h2 className="text-lg font-semibold mb-2">Check your email</h2>
              <p className="text-muted">
                We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>.
                Click the link in the email to activate your account.
              </p>
            </div>
            <p className="text-muted text-sm">
              Didn&apos;t get the email? Check your spam folder or{" "}
              <button onClick={() => setEmailSent(false)} className="text-accent hover:underline">try again</button>.
            </p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create account
          </button>

          <p className="text-center text-muted text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </form>
        )}
      </div>
    </div>
  );
}
