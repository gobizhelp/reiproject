"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Link2, Mail, MessageCircle, X, Check } from "lucide-react";

interface ShareButtonProps {
  slug: string;
  address: string;
  /** "icon" renders just an icon button, "full" renders a labeled button */
  variant?: "icon" | "full";
  className?: string;
}

export default function ShareButton({ slug, address, variant = "icon", className = "" }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/deals/${slug}`
    : `/deals/${slug}`;
  const shareText = `Check out this property: ${address}`;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: address, text: shareText, url: shareUrl });
      } catch {
        // User cancelled or share failed silently
      }
      setOpen(false);
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1500);
  }

  function handleEmail() {
    const subject = encodeURIComponent(`Property Deal: ${address}`);
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
    setOpen(false);
  }

  function handleSMS() {
    const body = encodeURIComponent(`${shareText} ${shareUrl}`);
    window.open(`sms:?body=${body}`, "_self");
    setOpen(false);
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // On mobile, try native share directly
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      handleNativeShare();
      return;
    }
    setOpen(!open);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleClick}
        className={variant === "full"
          ? `flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors bg-card border border-border text-muted hover:text-foreground hover:border-muted ${className}`
          : `p-2 rounded-full backdrop-blur-sm transition-colors bg-black/40 text-white/80 hover:bg-black/60 hover:text-white ${className}`
        }
        title="Share property"
      >
        <Share2 className={variant === "full" ? "w-4 h-4" : "w-4 h-4"} />
        {variant === "full" && "Share"}
      </button>

      {open && (
        <div
          className="absolute z-50 right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold">Share Property</span>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="py-1">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-background transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <Link2 className="w-4 h-4 text-muted" />}
              {copied ? "Link Copied!" : "Copy Link"}
            </button>
            <button
              onClick={handleEmail}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-background transition-colors"
            >
              <Mail className="w-4 h-4 text-muted" />
              Email
            </button>
            <button
              onClick={handleSMS}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-background transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-muted" />
              Text Message
            </button>
            {typeof navigator !== "undefined" && navigator.share && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-background transition-colors"
              >
                <Share2 className="w-4 h-4 text-muted" />
                More Options...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
