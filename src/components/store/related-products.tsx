import { db } from "@/db"
import { products, productImages, promotions } from "@/db/schema"
import { eq, and, ne, asc } from "drizzle-orm"
import { ProductCard } from "./product-card"

interface RelatedProductsProps {
  categoryId: string | null
  currentProductId: string
}

export async function RelatedProducts({
  categoryId,
  currentProductId,
}: RelatedProductsProps) {
  if (!categoryId) return null

  const related = await db.query.products.findMany({
    where: and(
      eq(products.categoryId, categoryId),
      ne(products.id, currentProductId),
      eq(products.isActive, true)
    ),
    limit: 4,
    with: {
      category: true,
      images: { orderBy: asc(productImages.position), limit: 1 },
      promotions: { where: eq(promotions.isActive, true) },
    },
  })

  if (related.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold mb-4">You Might Also Like</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
