import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db, orders, users } from "@/db"
import { eq, and } from "drizzle-orm"

const CANCELLABLE_STATUSES = ["pending", "confirmed"]

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  if (body.action !== "cancel")
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, userId) })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, id), eq(orders.userId, user.id)),
  })

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return NextResponse.json(
      { error: "This order can no longer be cancelled." },
      { status: 422 }
    )
  }

  await db
    .update(orders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(orders.id, id))

  return NextResponse.json({ success: true })
}
