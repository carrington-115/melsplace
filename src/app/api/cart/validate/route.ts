import { NextResponse } from "next/server"
import { db } from "@/db"
import { products } from "@/db/schema"
import { eq } from "drizzle-orm"

interface ValidateItem {
  productId: string
  quantity: number
}

// POST /api/cart/validate — check cart items before checkout
export async function POST(req: Request) {
  const { items }: { items: ValidateItem[] } = await req.json()

  if (!items || items.length === 0) {
    return NextResponse.json({ valid: true, errors: [] })
  }

  const errors: Array<{ productId: string; message: string }> = []

  await Promise.all(
    items.map(async ({ productId, quantity }) => {
      const product = await db.query.products.findFirst({
        where: eq(products.id, productId),
      })
      if (!product) {
        errors.push({ productId, message: "Product no longer exists" })
        return
      }
      if (!product.isActive) {
        errors.push({ productId, message: `"${product.name}" is no longer available` })
        return
      }
      if (product.inventory < quantity) {
        errors.push({
          productId,
          message:
            product.inventory === 0
              ? `"${product.name}" is out of stock`
              : `Only ${product.inventory} of "${product.name}" available`,
        })
      }
    })
  )

  return NextResponse.json({ valid: errors.length === 0, errors })
}
