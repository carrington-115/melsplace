import { db, users, orders } from "@/db"
import { eq, count, sql } from "drizzle-orm"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatPrice } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Customers" }

export default async function CustomersPage() {
  const customerList = await db.query.users.findMany({
    where: eq(users.role, "customer"),
    orderBy: (u, { desc }) => [desc(u.createdAt)],
    with: { orders: true },
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-muted-foreground">
          {customerList.length} registered
        </p>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Phone</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Orders</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total Spent</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden sm:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customerList.map((customer) => {
              const totalSpent = customer.orders.reduce(
                (sum, o) => sum + Number(o.total),
                0
              )
              return (
                <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={customer.avatarUrl ?? undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {customer.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {customer.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {customer.orders.length}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatPrice(totalSpent)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                    {new Date(customer.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {customerList.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No customers yet.
          </div>
        )}
      </div>
    </div>
  )
}
