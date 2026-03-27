import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reireach.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/settings/",
          "/messages/",
          "/properties/",
          "/buyers/",
          "/deal-pipeline/",
          "/matched-listings/",
          "/saved-listings/",
          "/my-buy-boxes/",
          "/marketplace/",
          "/suspended/",
          "/auth/",
          "/api/",
          "/login",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
