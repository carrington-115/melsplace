import { NextResponse } from "next/server"
import { db, products } from "@/db"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/lib/require-admin"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await db.delete(products).where(eq(products.id, id))
  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json()

  await db
    .update(products)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(products.id, id))

  return NextResponse.json({ success: true })
}
