"use client"

import Link from "next/link"
import { Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/store/product-card"
import { useWishlistStore } from "@/hooks/use-wishlist"
import { useEffect, useState } from "react"
import type { ProductWithCategory } from "@/types"

export default function WishlistPage() {
  const { productIds } = useWishlistStore()
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (productIds.length === 0) {
      setLoading(false)
      return
    }
    fetch(`/api/products?ids=${productIds.join(",")}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false))
  }, [productIds])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 w-40 bg-muted rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: Math.max(productIds.length, 4) }).map((_, i) => (
            <div key={i} className="rounded-xl border overflow-hidden">
              <div className="aspect-square w-full bg-muted animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>

      {productIds.length === 0 ? (
        <div className="flex flex-col items-center text-center py-20 gap-5">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Heart className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-semibold mb-1">Your wishlist is empty</h2>
            <p className="text-muted-foreground text-sm">
              Tap the heart icon on any product to save it here.
            </p>
          </div>
          <Button asChild>
            <Link href="/products">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse Products
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
