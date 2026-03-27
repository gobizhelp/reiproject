import { createClient } from "@/lib/supabase/server";
import { profileHasSellerFeature, profileSellerLimit } from "@/lib/membership/feature-gate";
import type { Profile } from "@/lib/profile-types";

// Duplicate/clone a listing
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { property_id } = await request.json();
  if (!property_id) {
    return Response.json({ error: "Missing property_id" }, { status: 400 });
  }

  // Check feature access
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profileHasSellerFeature(profile as Profile, "duplicate_listing")) {
    return Response.json({ error: "Upgrade to Pro to duplicate listings" }, { status: 403 });
  }

  // Check listing limit
  const maxListings = profileSellerLimit(profile as Profile, "max_active_listings");
  const { count: currentCount } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .in("seller_status", ["active", "pending"]);

  if (currentCount && currentCount >= maxListings) {
    return Response.json(
      { error: `You've reached your limit of ${maxListings} active listings` },
      { status: 400 }
    );
  }

  // Fetch the original property
  const { data: original } = await supabase
    .from("properties")
    .select("*")
    .eq("id", property_id)
    .eq("user_id", user.id)
    .single();

  if (!original) {
    return Response.json({ error: "Property not found" }, { status: 404 });
  }

  // Generate a new slug
  const slug = `${original.street_address}-${original.city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) + "-" + Math.random().toString(36).slice(2, 8);

  // Clone the property as a draft (exclude system fields)
  const {
    id: _id,
    slug: _slug,
    user_id: _userId,
    created_at: _created,
    updated_at: _updated,
    published_at: _published,
    is_featured: _featured,
    moderation_status: _modStatus,
    moderation_note: _modNote,
    moderated_at: _modAt,
    moderated_by: _modBy,
    seller_status: _sellerStatus,
    property_photos: _photos,
    comps: _comps,
    ...propertyFields
  } = original;

  const { data: newProperty, error } = await supabase
    .from("properties")
    .insert({
      ...propertyFields,
      title: `${original.title || original.street_address} (Copy)`,
      slug,
      user_id: user.id,
      status: "draft",
      seller_status: "active",
      is_featured: false,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Clone comps if any
  const { data: comps } = await supabase
    .from("comps")
    .select("address, sale_price, sqft, beds, baths, date_sold, distance")
    .eq("property_id", property_id);

  if (comps && comps.length > 0) {
    await supabase.from("comps").insert(
      comps.map((c) => ({ ...c, property_id: newProperty.id }))
    );
  }

  return Response.json({ id: newProperty.id, slug: newProperty.slug });
}
