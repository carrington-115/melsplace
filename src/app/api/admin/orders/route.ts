import { NextResponse } from "next/server"
import { db, orders } from "@/db"
import { requireAdmin } from "@/lib/require-admin"

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const allOrders = await db.query.orders.findMany({
    orderBy: (o, { desc }) => [desc(o.createdAt)],
    with: {
      user: true,
      items: true,
      shippingAddress: true,
    },
  })

  return NextResponse.json({ orders: allOrders })
}
