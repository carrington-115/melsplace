"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WishlistButton } from "./wishlist-button"
import { useCartStore } from "@/hooks/use-cart"
import { formatPrice, getDiscountedPrice } from "@/lib/utils"
import { toast } from "sonner"
import type { ProductWithCategory, Promotion } from "@/types"

interface ProductCardProps {
  product: ProductWithCategory & { promotions?: Promotion[] }
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

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore()
  const activePromo = product.promotions?.find((p) => p.isActive)

  const displayPrice = activePromo
    ? getDiscountedPrice(
        Number(product.price),
        activePromo.discountType,
        Number(activePromo.discountValue)
      )
    : null

  const primaryImage = product.images?.[0]?.url
  const flag = product.originCountry
    ? COUNTRY_FLAGS[product.originCountry]
    : null
  const isLowStock = product.inventory > 0 && product.inventory <= 5
  const isOutOfStock = product.inventory === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    addItem(product)
    toast.success("Added to cart", { description: product.name })
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="rounded-xl border bg-card overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              unoptimized
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-4xl">🌍</div>
            </div>
          )}

          {/* Stock badges — top left */}
          {(isLowStock || isOutOfStock) && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isLowStock && !isOutOfStock && (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  Only {product.inventory} left!
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  Out of Stock
                </Badge>
              )}
            </div>
          )}

          {/* Promotion ribbon — full-width strip at bottom of image */}
          {activePromo && (
            <div className="absolute bottom-0 left-0 right-0 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[11px] font-bold text-center py-1.5 tracking-wide">
              {activePromo.label}
            </div>
          )}

          {/* Wishlist button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <WishlistButton
              productId={product.id}
              productName={product.name}
              className="bg-background/80 backdrop-blur-sm hover:bg-background"
            />
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium text-sm leading-tight line-clamp-2 flex-1">
              {product.name}
            </h3>
            {flag && (
              <span className="text-base shrink-0" title={product.originCountry ?? ""}>
                {flag}
              </span>
            )}
          </div>

          {product.category && (
            <p className="text-xs text-muted-foreground mb-2">
              {product.category.name}
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-semibold text-sm ${activePromo ? "text-primary" : "text-foreground"}`}>
                {formatPrice(displayPrice ?? Number(product.price))}
              </span>
              {displayPrice !== null ? (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(Number(product.price))}
                </span>
              ) : product.compareAtPrice ? (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(Number(product.compareAtPrice))}
                </span>
              ) : null}
            </div>

            <Button
              size="icon"
              className="h-8 w-8 rounded-full shrink-0"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
