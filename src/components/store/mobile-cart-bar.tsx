"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCartStore } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"

export function MobileCartBar() {
  const { items, getItemCount, getSubtotal } = useCartStore()
  const count = getItemCount()

  if (count === 0) return null

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-background border-t shadow-lg">
      <Link
        href="/cart"
        className="flex items-center justify-between bg-primary text-primary-foreground rounded-xl px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-foreground/20 text-xs font-bold">
            {count}
          </span>
          <span className="font-semibold text-sm">View Cart</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">{formatPrice(getSubtotal())}</span>
          <ShoppingBag className="h-5 w-5" />
        </div>
      </Link>
    </div>
  )
}
