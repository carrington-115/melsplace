import { NextResponse } from "next/server"
import { db, products, promotions, productImages } from "@/db"
import { eq, desc, asc } from "drizzle-orm"
import { productSchema } from "@/lib/validations/product"
import { slugify } from "@/lib/utils"
import { requireAdmin } from "@/lib/require-admin"

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const allProducts = await db.query.products.findMany({
    with: {
      category: true,
      images: { orderBy: asc(productImages.position) },
      promotions: { where: eq(promotions.isActive, true) },
    },
    orderBy: [desc(products.createdAt)],
  })

  return NextResponse.json({ products: allProducts })
}

export async function POST(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const parsed = productSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const slug = body.slug ?? slugify(parsed.data.name)
  const [product] = await db
    .insert(products)
    .values({
      ...parsed.data,
      slug,
      price: String(parsed.data.price),
      compareAtPrice: parsed.data.compareAtPrice
        ? String(parsed.data.compareAtPrice)
        : null,
    })
    .returning({ id: products.id })

  return NextResponse.json({ productId: product.id })
}
