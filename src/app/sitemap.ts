import type { MetadataRoute } from "next"
import { db } from "@/db"
import { products, categories } from "@/db/schema"
import { eq, asc } from "drizzle-orm"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://melsplace.com"

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/faqs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ]

  const [productList, categoryList] = await Promise.all([
    db
      .select({ slug: products.slug, updatedAt: products.updatedAt })
      .from(products)
      .where(eq(products.isActive, true))
      .catch(() => [] as { slug: string; updatedAt: Date }[]),
    db
      .select({ slug: categories.slug })
      .from(categories)
      .orderBy(asc(categories.displayOrder))
      .catch(() => [] as { slug: string }[]),
  ])

  const productRoutes: MetadataRoute.Sitemap = productList.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = categoryList.map((c) => ({
    url: `${base}/products?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [...staticRoutes, ...productRoutes, ...categoryRoutes]
}
