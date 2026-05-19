import { db, orders, products, users } from "@/db"
import { eq, count, sql, lte, and } from "drizzle-orm"
import { ShoppingBag, Package, Users, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { OrderStatusBadge } from "@/components/store/order-status-badge"
import Link from "next/link"
import { OrdersChart } from "@/components/admin/orders-chart"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  // Stats
  const [totalOrdersResult] = await db
    .select({ count: count() })
    .from(orders)

  const [pendingOrdersResult] = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.status, "pending"))

  const [totalProductsResult] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.isActive, true))

  const [totalCustomersResult] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "customer"))

  const totalRevenue = await db
    .select({ sum: sql<string>`sum(${orders.total})` })
    .from(orders)
    .where(eq(orders.status, "delivered"))

  // Low inventory alerts
  const lowInventory = await db.query.products.findMany({
    where: and(
      eq(products.isActive, true),
      lte(products.inventory, 5)
    ),
    orderBy: (p, { asc }) => [asc(p.inventory)],
    limit: 5,
  })

  // Recent orders
  const recentOrders = await db.query.orders.findMany({
    orderBy: (o, { desc }) => [desc(o.createdAt)],
    limit: 5,
    with: { user: true, items: true },
  })

  const stats = [
    {
      title: "Total Orders",
      value: totalOrdersResult.count,
      icon: ShoppingBag,
      href: "/dashboard/orders",
    },
    {
      title: "Pending Orders",
      value: pendingOrdersResult.count,
      icon: Clock,
      href: "/dashboard/orders",
      highlight: pendingOrdersResult.count > 0,
    },
    {
      title: "Active Products",
      value: totalProductsResult.count,
      icon: Package,
      href: "/dashboard/products",
    },
    {
      title: "Customers",
      value: totalCustomersResult.count,
      icon: Users,
      href: "/dashboard/customers",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Welcome back to Mel&apos;s Place
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className={`hover:shadow-md transition-shadow ${stat.highlight ? "border-primary" : ""}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.highlight ? "text-primary" : "text-muted-foreground"}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.highlight ? "text-primary" : ""}`}>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Revenue card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue (Delivered Orders)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">
            {formatPrice(Number(totalRevenue[0]?.sum ?? 0))}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Link href="/dashboard/orders" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="font-medium text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{order.user.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="text-sm font-medium">
                      {formatPrice(Number(order.total))}
                    </span>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="px-6 py-8 text-sm text-muted-foreground text-center">
                  No orders yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low inventory alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Low Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {lowInventory.map((product) => (
                <div key={product.id} className="flex items-center justify-between px-6 py-3">
                  <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                  <span className={`text-sm font-bold ${product.inventory === 0 ? "text-destructive" : "text-amber-600"}`}>
                    {product.inventory === 0 ? "Out" : `${product.inventory} left`}
                  </span>
                </div>
              ))}
              {lowInventory.length === 0 && (
                <p className="px-6 py-8 text-sm text-muted-foreground text-center">
                  All products well-stocked 🎉
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
