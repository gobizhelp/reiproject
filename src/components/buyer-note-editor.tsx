"use client";

import { useState, useEffect, useRef } from "react";
import { StickyNote, Save, Trash2, Lock, Pencil } from "lucide-react";

interface Props {
  propertyId: string;
  initialContent?: string;
  hasFeature: boolean;
  compact?: boolean;
}

export default function BuyerNoteEditor({ propertyId, initialContent, hasFeature, compact }: Props) {
  const [content, setContent] = useState(initialContent || "");
  const [savedContent, setSavedContent] = useState(initialContent || "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasUnsavedChanges = content !== savedContent;
  const hasNote = savedContent.length > 0;

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    const res = await fetch("/api/buyer-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, content: content.trim() }),
    });

    if (res.ok) {
      const data = await res.json();
      setSavedContent(data.note.content);
      setContent(data.note.content);
      setEditing(false);
    }
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch("/api/buyer-notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId }),
    });

    if (res.ok) {
      setContent("");
      setSavedContent("");
      setEditing(false);
    }
    setDeleting(false);
  }

  // Upgrade prompt for free-tier users
  if (!hasFeature) {
    return (
      <div className={`${compact ? "mt-3 pt-3 border-t border-border" : "bg-card border border-border rounded-2xl p-6"}`}>
        <div className="flex items-center gap-2 text-muted">
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">Private Notes</span>
          <span className="ml-auto text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">Pro</span>
        </div>
        <p className="text-xs text-muted mt-1">
          Upgrade to Pro to add private notes to listings.
        </p>
      </div>
    );
  }

  // Compact mode: collapsed by default for saved listings cards
  if (compact && !editing && !hasNote) {
    return (
      <div className="mt-3 pt-3 border-t border-border">
        <button
          onClick={() => setEditing(true)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-muted hover:text-foreground py-2 rounded-lg border border-border hover:border-muted transition-colors"
        >
          <StickyNote className="w-3.5 h-3.5" />
          Add Note
        </button>
      </div>
    );
  }

  if (compact && !editing && hasNote) {
    return (
      <div className="mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 mb-1">
          <StickyNote className="w-3 h-3 text-amber-400" />
          <span className="text-xs font-medium text-amber-400">Your Note</span>
          <button
            onClick={() => setEditing(true)}
            className="ml-auto text-muted hover:text-foreground transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>
        <p className="text-xs text-muted line-clamp-3 whitespace-pre-wrap">{savedContent}</p>
      </div>
    );
  }

  // Full mode (deal detail page) or editing in compact mode
  return (
    <div className={compact ? "mt-3 pt-3 border-t border-border" : "bg-card border border-amber-500/30 rounded-2xl p-6"}>
      <div className="flex items-center gap-2 mb-3">
        <StickyNote className={`${compact ? "w-3.5 h-3.5" : "w-5 h-5"} text-amber-400`} />
        <h3 className={`${compact ? "text-xs" : "text-lg"} font-bold`}>
          {hasNote ? "Your Note" : "Add a Note"}
        </h3>
        <span className="text-xs text-muted">Only you can see this</span>
      </div>

      {!compact && !editing && hasNote ? (
        <div>
          <p className="text-sm whitespace-pre-wrap mb-3">{savedContent}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:border-muted transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-danger px-3 py-1.5 rounded-lg border border-border hover:border-danger/30 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3 h-3" />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add your private notes about this property..."
            rows={compact ? 3 : 4}
            className={`w-full bg-background border border-border rounded-lg px-3 py-2 ${compact ? "text-xs" : "text-sm"} text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none`}
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleSave}
              disabled={saving || !content.trim() || !hasUnsavedChanges}
              className={`flex items-center gap-1.5 ${compact ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"} font-medium rounded-lg transition-colors bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 disabled:opacity-50`}
            >
              <Save className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
              {saving ? "Saving..." : "Save Note"}
            </button>
            {(editing || compact) && (
              <button
                onClick={() => {
                  setContent(savedContent);
                  setEditing(false);
                }}
                className={`${compact ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"} font-medium text-muted hover:text-foreground rounded-lg border border-border hover:border-muted transition-colors`}
              >
                Cancel
              </button>
            )}
            {hasNote && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`ml-auto flex items-center gap-1.5 ${compact ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2"} font-medium text-muted hover:text-danger rounded-lg border border-border hover:border-danger/30 transition-colors disabled:opacity-50`}
              >
                <Trash2 className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
