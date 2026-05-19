import { NextResponse } from "next/server"
import { db, promotions } from "@/db"
import { promotionSchema } from "@/lib/validations/product"
import { requireAdmin } from "@/lib/require-admin"

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const all = await db.query.promotions.findMany({
    with: { product: true },
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  })
  return NextResponse.json({ promotions: all })
}

export async function POST(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const parsed = promotionSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [promo] = await db
    .insert(promotions)
    .values({
      ...parsed.data,
      discountValue: String(parsed.data.discountValue),
      startsAt: new Date(parsed.data.startsAt),
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
    })
    .returning()

  return NextResponse.json({ promotion: promo })
}
