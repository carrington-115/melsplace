"use client"

import Link from "next/link"
import { ShoppingCart, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CartItemRow } from "@/components/store/cart-item"
import { useCartStore } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import { CheckoutForm } from "./checkout-form"

const TAX_RATE = 0.0725 // NC 7.25%
const SHIPPING_FLAT = 8.99
const FREE_SHIPPING_THRESHOLD = 75

export function CartClient() {
  const { items, getSubtotal } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground">
            Discover our authentic African food products and add them to your cart.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  const subtotal = getSubtotal()
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
  const tax = subtotal * TAX_RATE
  const total = subtotal + shipping + tax

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border divide-y">
            {items.map((item) => (
              <div key={item.productId} className="px-4">
                <CartItemRow item={item} />
              </div>
            ))}
          </div>

          {/* Free shipping notice */}
          {subtotal < FREE_SHIPPING_THRESHOLD && (
            <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 flex items-center gap-3">
              <Package className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Add{" "}
                <span className="font-semibold">
                  {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}
                </span>{" "}
                more to get free shipping!
              </p>
            </div>
          )}
          {subtotal >= FREE_SHIPPING_THRESHOLD && (
            <div className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3 flex items-center gap-3">
              <Package className="h-4 w-4 text-emerald-600 shrink-0" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                🎉 You qualify for free shipping!
              </p>
            </div>
          )}
        </div>

        {/* Order summary + checkout form */}
        <div className="space-y-4">
          <div className="rounded-xl border p-5 space-y-3">
            <h2 className="font-semibold text-lg">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-medium">FREE</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Tax (NC 7.25%)
                </span>
                <span>{formatPrice(tax)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <CheckoutForm
            subtotal={subtotal}
            tax={tax}
            shipping={shipping}
            total={total}
          />
        </div>
      </div>
    </div>
  )
}
