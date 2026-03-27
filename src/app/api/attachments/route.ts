import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { profileHasSellerFeature } from "@/lib/membership/feature-gate";
import type { Profile } from "@/lib/profile-types";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ATTACHMENTS_PER_PROPERTY = 10;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
];

// GET: Fetch attachments for a property
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const propertyId = request.nextUrl.searchParams.get("propertyId");
  if (!propertyId) {
    return Response.json({ error: "propertyId is required" }, { status: 400 });
  }

  const { data: attachments, error } = await supabase
    .from("property_attachments")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ attachments: attachments || [] });
}

// POST: Upload an attachment
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check seller tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  if (!profileHasSellerFeature(profile as Profile, "attachment_uploads")) {
    return Response.json(
      { error: "Upgrade to Pro to upload attachments" },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const propertyId = formData.get("propertyId") as string | null;

  if (!file || !propertyId) {
    return Response.json({ error: "file and propertyId are required" }, { status: 400 });
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { error: "File type not allowed. Accepted: PDF, Word, Excel, JPG, PNG, WebP" },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "File too large. Maximum size is 10MB" }, { status: 400 });
  }

  // Verify property ownership
  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("user_id", user.id)
    .single();

  if (!property) {
    return Response.json({ error: "Property not found or not owned by you" }, { status: 404 });
  }

  // Check attachment count limit
  const { count } = await supabase
    .from("property_attachments")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);

  if ((count || 0) >= MAX_ATTACHMENTS_PER_PROPERTY) {
    return Response.json(
      { error: `Maximum ${MAX_ATTACHMENTS_PER_PROPERTY} attachments per property` },
      { status: 400 }
    );
  }

  // Upload to Supabase Storage
  const fileExt = file.name.split(".").pop();
  const storagePath = `attachments/${propertyId}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("property-photos")
    .upload(storagePath, file);

  if (uploadError) {
    return Response.json({ error: "Upload failed: " + uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("property-photos").getPublicUrl(storagePath);

  // Insert DB record
  const { data: attachment, error: insertError } = await supabase
    .from("property_attachments")
    .insert({
      property_id: propertyId,
      user_id: user.id,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      url: publicUrl,
      storage_path: storagePath,
    })
    .select()
    .single();

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 });
  }

  return Response.json({ attachment });
}

// DELETE: Remove an attachment
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { attachmentId } = body;

  if (!attachmentId) {
    return Response.json({ error: "attachmentId is required" }, { status: 400 });
  }

  // Get attachment to find storage path
  const { data: attachment } = await supabase
    .from("property_attachments")
    .select("*")
    .eq("id", attachmentId)
    .eq("user_id", user.id)
    .single();

  if (!attachment) {
    return Response.json({ error: "Attachment not found" }, { status: 404 });
  }

  // Delete from storage
  await supabase.storage
    .from("property-photos")
    .remove([attachment.storage_path]);

  // Delete DB record
  const { error } = await supabase
    .from("property_attachments")
    .delete()
    .eq("id", attachmentId)
    .eq("user_id", user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: "Deleted" });
}
