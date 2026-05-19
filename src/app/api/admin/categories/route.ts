import { NextResponse } from "next/server"
import { db, categories } from "@/db"
import { asc } from "drizzle-orm"
import { categorySchema } from "@/lib/validations/product"
import { slugify } from "@/lib/utils"
import { requireAdmin } from "@/lib/require-admin"

export async function GET() {
  const allCategories = await db.query.categories.findMany({
    orderBy: asc(categories.displayOrder),
  })
  return NextResponse.json({ categories: allCategories })
}

export async function POST(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const parsed = categorySchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const slug = slugify(parsed.data.name)

  let category
  try {
    ;[category] = await db
      .insert(categories)
      .values({
        ...parsed.data,
        slug,
        description: parsed.data.description || null,
      })
      .returning()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ""
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json(
        { error: `A category named "${parsed.data.name}" already exists` },
        { status: 409 }
      )
    }
    throw err
  }

  return NextResponse.json({ category })
}
