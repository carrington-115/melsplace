import { notFound } from "next/navigation"
import { db } from "@/db"
import { products, categories, productImages, promotions } from "@/db/schema"
import { eq, and, asc, or, isNull } from "drizzle-orm"
import { ProductCarousel } from "@/components/store/product-carousel"
import { RelatedProducts } from "@/components/store/related-products"
import { AddToCartSection } from "./add-to-cart-section"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tag } from "lucide-react"
import { formatPrice, getDiscountedPrice } from "@/lib/utils"
import type { Metadata } from "next"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: { images: { limit: 1 } },
  })

  if (!product) return { title: "Product Not Found" }

  const description = product.description ?? `Buy ${product.name} at Mel's Place — authentic African food delivered across the US.`
  const ogImages = product.images[0]
    ? [{ url: product.images[0].url, width: 800, height: 800, alt: product.name }]
    : []

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} | Mel's Place`,
      description,
      type: "website",
      url: `/products/${slug}`,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Mel's Place`,
      description,
      images: ogImages.map((i) => i.url),
    },
  }
}

const COUNTRY_FLAGS: Record<string, string> = {
  Nigeria: "🇳🇬",
  Ghana: "🇬🇭",
  Senegal: "🇸🇳",
  Ethiopia: "🇪🇹",
  Kenya: "🇰🇪",
  "Ivory Coast": "🇨🇮",
  Cameroon: "🇨🇲",
  "South Africa": "🇿🇦",
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  const product = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1)
    .then((rows) => rows[0] ?? null)

  if (!product || !product.isActive) notFound()

  const [images, activePromotions, category] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.position)),
    db
      .select()
      .from(promotions)
      .where(
        and(
          or(eq(promotions.productId, product.id), isNull(promotions.productId)),
          eq(promotions.isActive, true)
        )
      ),
    product.categoryId
      ? db
          .select()
          .from(categories)
          .where(eq(categories.id, product.categoryId))
          .limit(1)
          .then((rows) => rows[0] ?? null)
      : Promise.resolve(null),
  ])

  const activePromo = activePromotions.find((p) => p.isActive)
  const displayPrice = activePromo
    ? getDiscountedPrice(
        Number(product.price),
        activePromo.discountType,
        Number(activePromo.discountValue)
      )
    : null

  const isLowStock = product.inventory > 0 && product.inventory <= 5
  const isOutOfStock = product.inventory === 0
  const flag = product.originCountry
    ? COUNTRY_FLAGS[product.originCountry]
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Images */}
        <div>
          <ProductCarousel images={images} productName={product.name} />
        </div>

        {/* Right: Info */}
        <div className="space-y-5">
          {/* Category & badges */}
          <div className="flex flex-wrap gap-2 items-center">
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            )}
            {activePromo && (
              <Badge className="text-xs font-semibold">
                {activePromo.label}
              </Badge>
            )}
            {isLowStock && (
              <Badge variant="destructive" className="text-xs">
                Only {product.inventory} left!
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="secondary" className="text-xs">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            {product.name}
          </h1>

          {/* Manufacturer & Origin */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            {product.manufacturer && (
              <span>By <span className="text-foreground font-medium">{product.manufacturer}</span></span>
            )}
            {product.originCountry && (
              <span>
                {flag} Origin:{" "}
                <span className="text-foreground font-medium">
                  {product.originCountry}
                </span>
              </span>
            )}
            {product.weightGrams && (
              <span>
                Weight:{" "}
                <span className="text-foreground font-medium">
                  {product.weightGrams >= 1000
                    ? `${product.weightGrams / 1000}kg`
                    : `${product.weightGrams}g`}
                </span>
              </span>
            )}
          </div>

          {/* Promotion banner */}
          {activePromo && (
            <div className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-3 flex items-start gap-3">
              <Tag className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-primary">{activePromo.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activePromo.discountType === "percentage"
                    ? `${activePromo.discountValue}% off the listed price`
                    : activePromo.discountType === "fixed"
                      ? `$${activePromo.discountValue} off the listed price`
                      : "Buy one, get one free"}
                  {activePromo.endsAt && (
                    <> · Ends {new Date(activePromo.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-foreground">
              {formatPrice(displayPrice ?? Number(product.price))}
            </span>
            {displayPrice ? (
              <span className="text-lg text-muted-foreground line-through mb-0.5">
                {formatPrice(Number(product.price))}
              </span>
            ) : product.compareAtPrice ? (
              <span className="text-lg text-muted-foreground line-through mb-0.5">
                {formatPrice(Number(product.compareAtPrice))}
              </span>
            ) : null}
            {displayPrice && (
              <span className="text-sm font-medium text-primary mb-0.5">
                Save {formatPrice(Number(product.price) - displayPrice)}
              </span>
            )}
          </div>

          {/* Add to cart */}
          <AddToCartSection product={{ ...product, images, promotions: activePromotions, category }} />

          <Separator />

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Product details table */}
          <div>
            <h2 className="font-semibold mb-3">Product Details</h2>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {product.manufacturer && (
                    <tr className="border-b last:border-0">
                      <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium w-1/3">
                        Manufacturer
                      </td>
                      <td className="px-4 py-2.5">{product.manufacturer}</td>
                    </tr>
                  )}
                  {product.originCountry && (
                    <tr className="border-b last:border-0">
                      <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium w-1/3">
                        Country of Origin
                      </td>
                      <td className="px-4 py-2.5">
                        {flag} {product.originCountry}
                      </td>
                    </tr>
                  )}
                  {product.weightGrams && (
                    <tr className="border-b last:border-0">
                      <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium w-1/3">
                        Net Weight
                      </td>
                      <td className="px-4 py-2.5">
                        {product.weightGrams >= 1000
                          ? `${product.weightGrams / 1000}kg`
                          : `${product.weightGrams}g`}
                      </td>
                    </tr>
                  )}
                  <tr className="border-b last:border-0">
                    <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium w-1/3">
                      Availability
                    </td>
                    <td className="px-4 py-2.5">
                      {isOutOfStock ? (
                        <span className="text-destructive">Out of Stock</span>
                      ) : isLowStock ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          Low Stock ({product.inventory} left)
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                  {category && (
                    <tr className="border-b last:border-0">
                      <td className="px-4 py-2.5 text-muted-foreground bg-muted/30 font-medium w-1/3">
                        Category
                      </td>
                      <td className="px-4 py-2.5">{category.name}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warranty */}
          {product.warrantyInfo && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-1">
                Warranty & Quality Guarantee
              </h3>
              <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">
                {product.warrantyInfo}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      <RelatedProducts
        categoryId={product.categoryId}
        currentProductId={product.id}
      />
    </div>
  )
}
