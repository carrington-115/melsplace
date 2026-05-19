import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db, users, orders } from "@/db"
import { eq, desc } from "drizzle-orm"
import Link from "next/link"
import { Package, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/store/order-status-badge"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Orders" }

export default async function OrdersPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) redirect("/sign-in")

  const orderList = await db.query.orders.findMany({
    where: eq(orders.userId, user.id),
    orderBy: desc(orders.createdAt),
    with: { items: true },
  })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orderList.length === 0 ? (
        <div className="flex flex-col items-center text-center py-20 gap-5">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-semibold mb-1">No orders yet</h2>
            <p className="text-muted-foreground text-sm">
              Start shopping to see your orders here.
            </p>
          </div>
          <Button asChild>
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orderList.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-xl border bg-card p-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" · "}
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                    {" · "}
                    {order.fulfillmentType === "pickup"
                      ? "In-store pickup"
                      : "Delivery"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-semibold text-sm">
                    {formatPrice(Number(order.total))}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
