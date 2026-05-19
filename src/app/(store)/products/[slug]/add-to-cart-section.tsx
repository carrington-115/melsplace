"use client"

import { useState } from "react"
import { ShoppingCart, Heart, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/hooks/use-cart"
import { useWishlistStore } from "@/hooks/use-wishlist"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { ProductWithDetails } from "@/types"

interface AddToCartSectionProps {
  product: ProductWithDetails
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((s) => s.addItem)
  const { toggle, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product.id)
  const isOutOfStock = product.inventory === 0

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast.success(`Added ${quantity} × ${product.name} to cart`)
  }

  const handleWishlist = () => {
    toggle(product.id)
    toast(wishlisted ? "Removed from wishlist" : "Saved to wishlist", {
      description: product.name,
    })
  }

  return (
    <div className="space-y-3">
      {/* Quantity selector */}
      {!isOutOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Qty:</span>
          <div className="flex items-center rounded-lg border">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-10 text-center text-sm font-medium">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() =>
                setQuantity((q) => Math.min(q + 1, product.inventory))
              }
              disabled={quantity >= product.inventory}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          className="flex-1 gap-2"
          size="lg"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="h-4 w-4" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="px-4"
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all",
              wishlisted ? "fill-primary stroke-primary" : "stroke-current"
            )}
          />
        </Button>
      </div>
    </div>
  )
}
