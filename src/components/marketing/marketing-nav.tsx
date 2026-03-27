"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, ChevronDown, Menu, X } from "lucide-react";

const navLinks = [
  {
    label: "Platform",
    items: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "Features", href: "/features" },
      { label: "Demo", href: "/demo" },
    ],
  },
  {
    label: "Solutions",
    items: [
      { label: "For Sellers", href: "/for-sellers" },
      { label: "For Buyers", href: "/for-buyers" },
      { label: "Use Cases", href: "/use-cases" },
      { label: "Browse Listings", href: "/browse" },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function MarketingNav() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="w-7 h-7 text-accent" />
          <span className="text-xl font-bold">REI Reach</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((group) => (
            <div
              key={group.label}
              className="relative"
              onMouseEnter={() => setOpenDropdown(group.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground transition-colors">
                {group.label}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {openDropdown === group.label && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div className="bg-card border border-border rounded-lg shadow-lg py-2 min-w-[180px]">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-card-hover transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <Link
            href="/pricing"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Sign up free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-muted hover:text-foreground transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-2 text-sm text-foreground hover:text-accent transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="border-t border-border pt-4 space-y-2">
              <Link
                href="/pricing"
                className="block py-2 text-sm text-foreground hover:text-accent transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/login"
                className="block py-2 text-sm text-foreground hover:text-accent transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="block w-full text-center bg-accent hover:bg-accent-hover text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
