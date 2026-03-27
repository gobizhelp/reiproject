import { createClient } from "@/lib/supabase/server";
import { profileHasSellerFeature } from "@/lib/membership/feature-gate";
import type { Profile } from "@/lib/profile-types";

// Toggle featured status on a listing (Pro sellers get 1 featured listing)
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { property_id, is_featured } = await request.json();
  if (!property_id || typeof is_featured !== "boolean") {
    return Response.json({ error: "Missing property_id or is_featured" }, { status: 400 });
  }

  // Check feature access
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profileHasSellerFeature(profile as Profile, "featured_listing_badge")) {
    return Response.json({ error: "Upgrade to Pro to feature listings" }, { status: 403 });
  }

  // If featuring, check they don't already have a featured listing (limit 1)
  if (is_featured) {
    const { count } = await supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_featured", true)
      .neq("id", property_id);

    if (count && count >= 1) {
      return Response.json(
        { error: "You can only feature 1 listing at a time. Unfeature your current listing first." },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase
    .from("properties")
    .update({ is_featured, updated_at: new Date().toISOString() })
    .eq("id", property_id)
    .eq("user_id", user.id)
    .select("id, is_featured")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: "Property not found" }, { status: 404 });

  return Response.json(data);
}
