"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2, Trash2, X } from "lucide-react";

interface Template {
  id: string;
  name: string;
  template_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface Props {
  onApply: (data: Record<string, unknown>) => void;
  onClose: () => void;
}

export default function ListingTemplatePicker({ onApply, onClose }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    const res = await fetch("/api/listing-templates");
    if (res.ok) {
      const data = await res.json();
      setTemplates(data);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to load templates");
    }
    setLoading(false);
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Delete this template?")) return;
    const res = await fetch("/api/listing-templates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_id: id }),
    });
    if (res.ok) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold">Listing Templates</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted" />
            </div>
          ) : error ? (
            <p className="text-danger text-sm text-center py-4">{error}</p>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 text-muted mx-auto mb-3" />
              <p className="text-muted text-sm">No templates saved yet.</p>
              <p className="text-muted text-xs mt-1">Save a listing as a template from the property form.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent/50 transition-colors group"
                >
                  <button
                    onClick={() => onApply(template.template_data)}
                    className="flex-1 text-left"
                  >
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-muted text-xs mt-0.5">
                      {new Date(template.updated_at).toLocaleDateString()}
                    </p>
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition-all p-1.5"
                    title="Delete template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
