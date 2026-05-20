import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db, users, orders } from "@/db"
import { eq, desc } from "drizzle-orm"
import Link from "next/link"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrdersList } from "@/components/store/orders-list"
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
        <OrdersList orders={orderList} />
      )}
    </div>
  )
}
