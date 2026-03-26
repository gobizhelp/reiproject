"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2 } from "lucide-react";

interface Photo {
  id?: string;
  url: string;
  storage_path: string;
  display_order: number;
}

interface Props {
  propertyId?: string;
  existingPhotos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

export default function PhotoUpload({ propertyId, existingPhotos, onPhotosChange }: Props) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    const supabase = createClient();
    const newPhotos: Photo[] = [];

    for (const file of acceptedFiles) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("property-photos")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("property-photos")
        .getPublicUrl(filePath);

      // If we have a property ID, insert the photo record
      if (propertyId) {
        const { data: photoRecord } = await supabase
          .from("property_photos")
          .insert({
            property_id: propertyId,
            url: publicUrl,
            storage_path: filePath,
            display_order: existingPhotos.length + newPhotos.length,
          })
          .select()
          .single();

        if (photoRecord) {
          newPhotos.push(photoRecord);
        }
      } else {
        // For new properties, we'll create the photo records after the property is created
        const { data: photoRecord } = await supabase
          .from("property_photos")
          .insert({
            property_id: "00000000-0000-0000-0000-000000000000", // placeholder
            url: publicUrl,
            storage_path: filePath,
            display_order: existingPhotos.length + newPhotos.length,
          })
          .select()
          .single();

        if (photoRecord) {
          newPhotos.push(photoRecord);
        }
      }
    }

    onPhotosChange([...existingPhotos, ...newPhotos]);
    setUploading(false);
  }, [existingPhotos, onPhotosChange, propertyId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 20,
  });

  async function removePhoto(index: number) {
    const photo = existingPhotos[index];
    if (photo.id) {
      const supabase = createClient();
      await supabase.from("property_photos").delete().eq("id", photo.id);
      await supabase.storage.from("property-photos").remove([photo.storage_path]);
    }
    const updated = existingPhotos.filter((_, i) => i !== index);
    onPhotosChange(updated);
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-accent bg-accent/5" : "border-border hover:border-muted"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            Uploading...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted">
            <Upload className="w-8 h-8" />
            <p>Drag & drop photos here, or click to select</p>
            <p className="text-sm">JPG, PNG, WebP up to 20 files</p>
          </div>
        )}
      </div>

      {existingPhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {existingPhotos.map((photo, index) => (
            <div key={photo.id || index} className="relative group rounded-lg overflow-hidden">
              <img src={photo.url} alt={`Photo ${index + 1}`} className="w-full h-32 object-cover" />
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-danger p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
