export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import ProfileSettings from "@/components/profile-settings";
import EmailDigestSettings from "@/components/email-digest-settings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isBuyer = profile?.user_role === "buyer" || profile?.user_role === "both";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ProfileSettings
        profile={profile}
        userEmail={user.email || ""}
        userId={user.id}
      />
      {isBuyer && (
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <EmailDigestSettings userId={user.id} />
        </div>
      )}
    </div>
  );
}
