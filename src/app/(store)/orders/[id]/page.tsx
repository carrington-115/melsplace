import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { db, users, orders } from "@/db"
import { eq, and } from "drizzle-orm"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, MapPin, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { OrderStatusBadge } from "@/components/store/order-status-badge"
import { OrderTracker } from "@/components/store/order-tracker"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: "Order Details" }

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) redirect("/sign-in")

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, id), eq(orders.userId, user.id)),
    with: {
      items: true,
      shippingAddress: true,
    },
  })

  if (!order) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/orders">
          <ArrowLeft className="h-4 w-4 mr-1" />
          All Orders
        </Link>
      </Button>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Order tracker */}
      <div className="rounded-xl border p-6 mb-6">
        <OrderTracker
          status={order.status}
          fulfillmentType={order.fulfillmentType}
        />
      </div>

      {/* Admin notes */}
      {order.adminNotes && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 mb-6">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
            Message from Mel&apos;s Place
          </p>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {order.adminNotes}
          </p>
        </div>
      )}

      {/* Items */}
      <div className="rounded-xl border mb-6">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold">
            {order.items.length}{" "}
            {order.items.length === 1 ? "Item" : "Items"}
          </h2>
        </div>
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                {item.productImageUrl ? (
                  <Image
                    src={item.productImageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xl">
                    🌍
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.productName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatPrice(Number(item.unitPrice))} × {item.quantity}
                </p>
              </div>
              <span className="font-semibold text-sm shrink-0">
                {formatPrice(Number(item.totalPrice))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border p-5 mb-6 space-y-2">
        <h2 className="font-semibold mb-3">Order Summary</h2>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(Number(order.subtotal))}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {Number(order.shipping) === 0 ? (
              <span className="text-emerald-600">FREE</span>
            ) : (
              formatPrice(Number(order.shipping))
            )}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatPrice(Number(order.tax))}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPrice(Number(order.total))}</span>
        </div>
      </div>

      {/* Fulfillment info */}
      <div className="rounded-xl border p-5">
        <h2 className="font-semibold mb-3">Fulfillment</h2>
        {order.fulfillmentType === "pickup" ? (
          <div className="flex items-start gap-3">
            <Store className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">In-Store Pickup</p>
              <p className="text-sm text-muted-foreground">
                Charlotte, NC · We&apos;ll notify you when your order is ready.
              </p>
            </div>
          </div>
        ) : order.shippingAddress ? (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">
                {order.shippingAddress.label ?? "Delivery Address"}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress.line1}
                {order.shippingAddress.line2
                  ? `, ${order.shippingAddress.line2}`
                  : ""}
              </p>
              <p className="text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zip}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Delivery address not provided.
          </p>
        )}
      </div>
    </div>
  )
}
