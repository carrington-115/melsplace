import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://melsplace.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/contact", "/faqs", "/terms", "/privacy"],
        disallow: ["/cart", "/wishlist", "/orders", "/settings", "/dashboard", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
