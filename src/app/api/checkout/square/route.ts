import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { SquareClient, SquareEnvironment } from "square"
import { db } from "@/db"
import { orders, users } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { randomUUID } from "crypto"

function getSquareClient() {
  const token = process.env.SQUARE_ACCESS_TOKEN
  const env = process.env.SQUARE_ENVIRONMENT
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN is not set")
  return new SquareClient({
    token,
    environment:
      env === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
  })
}

// POST /api/checkout/square — create a Square payment link for a delivery order
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, userId) })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { orderId } = await req.json()
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 })

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.userId, user.id)),
    with: { items: true },
  })
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  if (order.fulfillmentType !== "delivery") {
    return NextResponse.json({ error: "Square payments are for delivery orders only" }, { status: 400 })
  }

  const locationId = process.env.SQUARE_LOCATION_ID
  if (!locationId) throw new Error("SQUARE_LOCATION_ID is not set")

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const square = getSquareClient()

  const response = await square.checkout.paymentLinks.create({
    idempotencyKey: randomUUID(),
    order: {
      locationId,
      referenceId: order.id,
      lineItems: order.items.map((item) => ({
        name: item.productName,
        quantity: String(item.quantity),
        basePriceMoney: {
          // Square uses cents as integers
          amount: BigInt(Math.round(Number(item.unitPrice) * 100)),
          currency: "USD",
        },
      })),
    },
    checkoutOptions: {
      redirectUrl: `${appUrl}/orders/${order.id}?payment_result=success`,
    },
    paymentNote: order.id,
  })

  const checkoutUrl = response.paymentLink?.url
  if (!checkoutUrl) {
    const errMsg = response.errors?.[0]?.detail ?? "Failed to create payment link"
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }

  // Mark order as awaiting payment
  await db
    .update(orders)
    .set({ paymentStatus: "pending", updatedAt: new Date() })
    .where(eq(orders.id, order.id))

  return NextResponse.json({ checkoutUrl })
}
