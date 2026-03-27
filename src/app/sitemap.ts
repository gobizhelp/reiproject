import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reireach.com";

  const staticPages = [
    "",
    "/about",
    "/browse",
    "/contact",
    "/demo",
    "/faq",
    "/features",
    "/for-buyers",
    "/for-sellers",
    "/how-it-works",
    "/pricing",
    "/privacy",
    "/signup",
    "/support",
    "/terms",
    "/testimonials",
    "/use-cases",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  let dealEntries: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminClient();
    const { data: deals } = await supabase
      .from("properties")
      .select("slug, updated_at")
      .eq("status", "published");

    dealEntries = (deals || []).map((deal) => ({
      url: `${baseUrl}/deals/${deal.slug}`,
      lastModified: new Date(deal.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));
  } catch {
    // Sitemap should not crash if DB is unavailable
  }

  return [...staticEntries, ...dealEntries];
}
