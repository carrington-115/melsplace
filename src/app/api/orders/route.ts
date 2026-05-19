import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db, users, orders, orderItems, addresses } from "@/db"
import { eq } from "drizzle-orm"
import { generateOrderNumber, formatPrice } from "@/lib/utils"
import {
  sendOrderConfirmationEmail,
  sendNewOrderNotification,
} from "@/lib/resend"

interface OrderItemInput {
  productId: string
  quantity: number
  productName: string
  productImageUrl: string | null
  unitPrice: number
}

interface PlaceOrderBody {
  fulfillmentType: "delivery" | "pickup"
  items: OrderItemInput[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  customerNotes?: string
  newAddress?: {
    label: string
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
    saveAddress?: boolean
  } | null
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: PlaceOrderBody = await req.json()

  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
  }

  // Look up internal user
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Handle delivery address
  let shippingAddressId: string | null = null
  if (body.fulfillmentType === "delivery" && body.newAddress) {
    const [addr] = await db
      .insert(addresses)
      .values({
        userId: user.id,
        label: body.newAddress.label ?? "Home",
        line1: body.newAddress.line1,
        line2: body.newAddress.line2 ?? null,
        city: body.newAddress.city,
        state: body.newAddress.state,
        zip: body.newAddress.zip,
        isDefault: false,
      })
      .returning({ id: addresses.id })
    shippingAddressId = addr.id
  }

  // Create order
  const orderNumber = generateOrderNumber()
  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      userId: user.id,
      status: "pending",
      fulfillmentType: body.fulfillmentType,
      subtotal: String(body.subtotal.toFixed(2)),
      tax: String(body.tax.toFixed(2)),
      shipping: String(body.shipping.toFixed(2)),
      total: String(body.total.toFixed(2)),
      shippingAddressId,
      customerNotes: body.customerNotes ?? null,
    })
    .returning({ id: orders.id })

  // Create order items
  await db.insert(orderItems).values(
    body.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.productImageUrl,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice.toFixed(2)),
      totalPrice: String((item.unitPrice * item.quantity).toFixed(2)),
    }))
  )

  // Send emails (non-blocking — don't fail the order if email fails)
  try {
    await sendOrderConfirmationEmail({
      to: user.email,
      customerName: user.name,
      orderNumber,
      orderTotal: formatPrice(body.total),
      items: body.items.map((i) => ({
        name: i.productName,
        quantity: i.quantity,
        price: formatPrice(i.unitPrice * i.quantity),
      })),
      fulfillmentType: body.fulfillmentType,
    })
    await sendNewOrderNotification({
      orderNumber,
      customerName: user.name,
      orderTotal: formatPrice(body.total),
    })
  } catch (err) {
    console.error("Email send failed:", err)
  }

  return NextResponse.json({ orderId: order.id, orderNumber })
}
