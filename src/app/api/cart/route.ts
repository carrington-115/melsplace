import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/db"
import {
  users,
  cartItems,
  products,
  productImages,
  promotions,
} from "@/db/schema"
import { eq, and, asc } from "drizzle-orm"

// GET /api/cart — return current user's cart items with product data
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, userId) })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const items = await db.query.cartItems.findMany({
    where: eq(cartItems.userId, user.id),
    with: {
      product: {
        with: {
          category: true,
          images: { orderBy: asc(productImages.position), limit: 1 },
        },
      },
    },
  })

  return NextResponse.json({ items })
}

// POST /api/cart — add or increment item { productId, quantity }
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, userId) })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { productId, quantity = 1 } = await req.json()
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 })

  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
  })
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 })

  const existing = await db.query.cartItems.findFirst({
    where: and(eq(cartItems.userId, user.id), eq(cartItems.productId, productId)),
  })

  if (existing) {
    const newQty = Math.min(existing.quantity + quantity, product.inventory)
    await db
      .update(cartItems)
      .set({ quantity: newQty, updatedAt: new Date() })
      .where(eq(cartItems.id, existing.id))
    return NextResponse.json({ quantity: newQty })
  }

  const qty = Math.min(quantity, product.inventory)
  await db.insert(cartItems).values({ userId: user.id, productId, quantity: qty })
  return NextResponse.json({ quantity: qty })
}

// PATCH /api/cart — set quantity { productId, quantity }
export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, userId) })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { productId, quantity } = await req.json()
  if (!productId || quantity == null) {
    return NextResponse.json({ error: "productId and quantity required" }, { status: 400 })
  }

  if (quantity <= 0) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, productId)))
    return NextResponse.json({ removed: true })
  }

  await db
    .update(cartItems)
    .set({ quantity, updatedAt: new Date() })
    .where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, productId)))

  return NextResponse.json({ quantity })
}

// DELETE /api/cart — remove item { productId } or clear all if no productId
export async function DELETE(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, userId) })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const { productId } = body

  if (productId) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, user.id), eq(cartItems.productId, productId)))
  } else {
    await db.delete(cartItems).where(eq(cartItems.userId, user.id))
  }

  return NextResponse.json({ ok: true })
}
