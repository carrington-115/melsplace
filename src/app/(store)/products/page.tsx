import { Suspense } from "react"
import { db } from "@/db"
import {
  products,
  categories,
  productImages,
  promotions,
} from "@/db/schema"
import { eq, and, ilike, asc, desc, or } from "drizzle-orm"
import { ProductCard } from "@/components/store/product-card"
import { CategoryFilter } from "@/components/store/category-filter"
import { SearchBar } from "@/components/store/search-bar"
import { Skeleton } from "@/components/ui/skeleton"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse our full range of authentic African food products — grains, spices, beverages, snacks, and more.",
}

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    sort?: string
  }>
}

async function ProductsGrid({
  categorySlug,
  search,
  sort,
}: {
  categorySlug?: string
  search?: string
  sort?: string
}) {
  // Resolve category id from slug
  let categoryId: string | undefined
  if (categorySlug) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug),
    })
    categoryId = cat?.id
  }

  // Build filters
  const filters = [eq(products.isActive, true)]
  if (categoryId) filters.push(eq(products.categoryId, categoryId))
  if (search) {
    const searchFilter = or(
      ilike(products.name, `%${search}%`),
      ilike(products.description, `%${search}%`),
      ilike(products.manufacturer, `%${search}%`)
    )
    if (searchFilter) filters.push(searchFilter)
  }

  // Build order
  const orderBy =
    sort === "price_asc"
      ? asc(products.price)
      : sort === "price_desc"
        ? desc(products.price)
        : desc(products.createdAt)

  const productList = await db.query.products.findMany({
    where: and(...filters),
    orderBy,
    with: {
      category: true,
      images: { orderBy: asc(productImages.position), limit: 1 },
      promotions: { where: eq(promotions.isActive, true) },
    },
  })

  if (productList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">🌍</div>
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground text-sm">
          {search
            ? `No results for "${search}". Try a different search.`
            : "No products in this category yet. Check back soon!"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {productList.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams
  const allCategories = await db.query.categories.findMany({
    orderBy: asc(categories.displayOrder),
  })

  const activeCategory = allCategories.find(
    (c) => c.slug === params.category
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {activeCategory ? activeCategory.name : "All Products"}
        </h1>
        {activeCategory?.description && (
          <p className="text-muted-foreground text-sm">
            {activeCategory.description}
          </p>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Suspense>
          <SearchBar />
        </Suspense>
        <Suspense>
          <CategoryFilter categories={allCategories} />
        </Suspense>
      </div>

      {/* Products grid */}
      <Suspense fallback={<ProductsGridSkeleton />}>
        <ProductsGrid
          categorySlug={params.category}
          search={params.search}
          sort={params.sort}
        />
      </Suspense>
    </div>
  )
}

function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-xl border overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
