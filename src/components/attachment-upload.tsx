"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2, FileText, File, Image } from "lucide-react";
import type { PropertyAttachment } from "@/lib/types";

interface Props {
  propertyId: string;
  hasAccess: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return <Image className="w-5 h-5 text-blue-400" />;
  if (fileType.includes("pdf")) return <FileText className="w-5 h-5 text-red-400" />;
  return <File className="w-5 h-5 text-muted" />;
}

export default function AttachmentUpload({ propertyId, hasAccess }: Props) {
  const [attachments, setAttachments] = useState<PropertyAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId || !hasAccess) {
      setLoading(false);
      return;
    }
    fetchAttachments();
  }, [propertyId, hasAccess]);

  async function fetchAttachments() {
    try {
      const res = await fetch(`/api/attachments?propertyId=${propertyId}`);
      if (res.ok) {
        const data = await res.json();
        setAttachments(data.attachments);
      }
    } catch {
      // Silently fail on load
    } finally {
      setLoading(false);
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setError(null);

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("propertyId", propertyId);

      try {
        const res = await fetch("/api/attachments", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Upload failed");
          continue;
        }

        const data = await res.json();
        setAttachments((prev) => [...prev, data.attachment]);
      } catch {
        setError("Upload failed");
      }
    }

    setUploading(false);
  }, [propertyId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
  });

  async function removeAttachment(id: string) {
    try {
      const res = await fetch("/api/attachments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attachmentId: id }),
      });

      if (res.ok) {
        setAttachments((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      // Silently fail
    }
  }

  if (!hasAccess) {
    return (
      <div className="border border-border/50 rounded-xl p-6 text-center">
        <Upload className="w-8 h-8 text-muted mx-auto mb-2" />
        <p className="text-muted text-sm mb-1">Attachment uploads are a Pro feature</p>
        <p className="text-muted text-xs">Upload rehab estimates, comps, flyers, and documents</p>
        <span className="inline-block mt-2 text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-semibold">PRO</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
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
            <Upload className="w-6 h-6" />
            <p className="text-sm">Drag & drop files here, or click to select</p>
            <p className="text-xs">PDF, Word, Excel, JPG, PNG, WebP (max 10MB each, up to 10 files)</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-danger text-sm mt-2">{error}</p>
      )}

      {attachments.length > 0 && (
        <div className="mt-4 space-y-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-3 group"
            >
              {getFileIcon(att.file_type)}
              <div className="min-w-0 flex-1">
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:text-accent truncate block"
                >
                  {att.file_name}
                </a>
                <p className="text-xs text-muted">{formatFileSize(att.file_size)}</p>
              </div>
              <button
                onClick={() => removeAttachment(att.id)}
                className="text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1"
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
