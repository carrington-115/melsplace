import { NextResponse } from "next/server"
import { WebhooksHelper } from "square"
import { db } from "@/db"
import { orders } from "@/db/schema"
import { eq } from "drizzle-orm"

// POST /api/webhooks/square — handle Square payment event notifications
export async function POST(req: Request) {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
  const notificationUrl = process.env.SQUARE_WEBHOOK_URL

  const rawBody = await req.text()

  // Verify signature if key is configured
  if (signatureKey && notificationUrl) {
    const signatureHeader = req.headers.get("x-square-hmacsha256-signature") ?? ""
    const isValid = await WebhooksHelper.verifySignature({
      requestBody: rawBody,
      signatureHeader,
      signatureKey,
      notificationUrl,
    })
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }
  }

  let event: {
    type: string
    data?: { object?: { payment?: { note?: string; order_id?: string; status?: string; id?: string } } }
  }

  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const payment = event.data?.object?.payment

  if (event.type === "payment.completed" && payment) {
    // payment.note stores our internal orderId set during checkout creation
    const internalOrderId = payment.note
    if (internalOrderId) {
      await db
        .update(orders)
        .set({
          paymentStatus: "paid",
          paymentId: payment.id ?? null,
          status: "confirmed",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, internalOrderId))
    }
  }

  if (event.type === "payment.updated" && payment?.status === "FAILED" && payment.note) {
    await db
      .update(orders)
      .set({ paymentStatus: "failed", updatedAt: new Date() })
      .where(eq(orders.id, payment.note))
  }

  return NextResponse.json({ received: true })
}
