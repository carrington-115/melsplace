import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/db"
import {
  users,
  orders,
  orderItems,
  addresses,
  products,
} from "@/db/schema"
import { eq, sql } from "drizzle-orm"
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

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Wrap all DB writes in a transaction so failures roll back atomically
  const { orderId, orderNumber } = await db.transaction(async (tx) => {
    // Handle delivery address
    let shippingAddressId: string | null = null
    if (body.fulfillmentType === "delivery" && body.newAddress) {
      const [addr] = await tx
        .insert(addresses)
        .values({
          userId: user.id,
          label: body.newAddress.label ?? "Home",
          line1: body.newAddress.line1,
          line2: body.newAddress.line2 ?? null,
          city: body.newAddress.city,
          state: body.newAddress.state,
          zip: body.newAddress.zip,
          isDefault: body.newAddress.saveAddress ? true : false,
        })
        .returning({ id: addresses.id })
      shippingAddressId = addr.id
    }

    // Create order
    const orderNum = generateOrderNumber()
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: orderNum,
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
    await tx.insert(orderItems).values(
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

    // Decrement inventory for each item
    await Promise.all(
      body.items.map((item) =>
        tx
          .update(products)
          .set({ inventory: sql`${products.inventory} - ${item.quantity}` })
          .where(eq(products.id, item.productId))
      )
    )

    return { orderId: order.id, orderNumber: orderNum }
  })

  // Send emails (non-blocking — order success is independent of email)
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

  return NextResponse.json({ orderId, orderNumber })
}
