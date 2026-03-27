import { createClient } from "@/lib/supabase/server";
import { profileHasSellerFeature } from "@/lib/membership/feature-gate";
import type { Profile } from "@/lib/profile-types";

// GET all templates for the current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profileHasSellerFeature(profile as Profile, "listing_templates")) {
    return Response.json({ error: "Upgrade to Pro to use listing templates" }, { status: 403 });
  }

  const { data: templates, error } = await supabase
    .from("listing_templates")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(templates);
}

// POST: Create a new template (or save from existing listing)
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profileHasSellerFeature(profile as Profile, "listing_templates")) {
    return Response.json({ error: "Upgrade to Pro to use listing templates" }, { status: 403 });
  }

  const { name, template_data, property_id } = await request.json();

  let data: Record<string, unknown> = template_data || {};

  // If saving from an existing property, extract its data
  if (property_id) {
    const { data: property } = await supabase
      .from("properties")
      .select("*")
      .eq("id", property_id)
      .eq("user_id", user.id)
      .single();

    if (!property) return Response.json({ error: "Property not found" }, { status: 404 });

    // Extract reusable fields (exclude unique identifiers)
    const {
      id: _id, slug: _slug, user_id: _uid, created_at: _c, updated_at: _u,
      published_at: _p, is_featured: _f, moderation_status: _ms, moderation_note: _mn,
      moderated_at: _ma, moderated_by: _mb, seller_status: _ss, street_address: _sa,
      title: _t, latitude: _lat, longitude: _lng, property_photos: _ph, comps: _co,
      ...templateFields
    } = property;
    data = templateFields;
  }

  if (!name) return Response.json({ error: "Template name is required" }, { status: 400 });

  const { data: template, error } = await supabase
    .from("listing_templates")
    .insert({ user_id: user.id, name, template_data: data })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(template);
}

// DELETE a template
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { template_id } = await request.json();
  if (!template_id) return Response.json({ error: "Missing template_id" }, { status: 400 });

  const { error } = await supabase
    .from("listing_templates")
    .delete()
    .eq("id", template_id)
    .eq("user_id", user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
