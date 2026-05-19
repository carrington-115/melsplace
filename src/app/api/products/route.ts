import { NextResponse } from "next/server"
import { db, products, productImages, promotions } from "@/db"
import { eq, inArray, asc } from "drizzle-orm"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? []

  if (ids.length === 0) {
    return NextResponse.json({ products: [] })
  }

  const result = await db.query.products.findMany({
    where: inArray(products.id, ids),
    with: {
      category: true,
      images: { orderBy: asc(productImages.position), limit: 1 },
      promotions: { where: eq(promotions.isActive, true) },
    },
  })

  return NextResponse.json({ products: result })
}
