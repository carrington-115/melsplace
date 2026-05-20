import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { users, wishlistItems } from "@/db/schema"
import { eq, and } from "drizzle-orm"

// GET /api/wishlist — return current user's wishlisted product IDs
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, userId) })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const items = await db.query.wishlistItems.findMany({
    where: eq(wishlistItems.userId, user.id),
    columns: { productId: true },
  })

  return NextResponse.json({ productIds: items.map((i) => i.productId) })
}

// POST /api/wishlist — toggle item { productId }
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, userId) })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 })

  const existing = await db.query.wishlistItems.findFirst({
    where: and(eq(wishlistItems.userId, user.id), eq(wishlistItems.productId, productId)),
  })

  if (existing) {
    await db
      .delete(wishlistItems)
      .where(and(eq(wishlistItems.userId, user.id), eq(wishlistItems.productId, productId)))
    return NextResponse.json({ wishlisted: false })
  }

  await db.insert(wishlistItems).values({ userId: user.id, productId })
  return NextResponse.json({ wishlisted: true })
}
