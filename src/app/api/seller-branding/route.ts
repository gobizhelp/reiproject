import { createClient } from "@/lib/supabase/server";
import { profileHasSellerFeature } from "@/lib/membership/feature-gate";
import type { Profile } from "@/lib/profile-types";

// GET seller branding data
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company_name, phone, logo_url, bio, website, seller_tier")
    .eq("id", user.id)
    .single();

  if (!profile) return Response.json({ error: "Profile not found" }, { status: 404 });
  return Response.json(profile);
}

// PATCH seller branding fields
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profileHasSellerFeature(profile as Profile, "branded_seller_profile")) {
    return Response.json({ error: "Upgrade to Pro to customize branding" }, { status: 403 });
  }

  const { logo_url, bio, website } = await request.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (logo_url !== undefined) updates.logo_url = logo_url || null;
  if (bio !== undefined) updates.bio = bio || null;
  if (website !== undefined) updates.website = website || null;

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select("full_name, company_name, phone, logo_url, bio, website")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
