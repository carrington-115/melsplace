"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import type { LocalCartItem } from "@/types"

interface CartItemProps {
  item: LocalCartItem
}

export function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()
  const image = item.product.images?.[0]?.url

  return (
    <div className="flex gap-4 py-4">
      {/* Image */}
      <Link href={`/products/${item.product.slug}`} className="shrink-0">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={item.product.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xl">
              🌍
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.product.slug}`}
          className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
        >
          {item.product.name}
        </Link>
        {item.product.category && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.product.category.name}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 gap-2">
          {/* Quantity stepper */}
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-r-none"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-xs font-medium">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-l-none"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.product.inventory}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price + Remove */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm">
              {formatPrice(Number(item.product.price) * item.quantity)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeItem(item.productId)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
