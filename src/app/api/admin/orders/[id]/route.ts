import { NextResponse } from "next/server"
import { db, orders } from "@/db"
import { eq } from "drizzle-orm"
import { updateOrderStatusSchema } from "@/lib/validations/order"
import { requireAdmin } from "@/lib/require-admin"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const parsed = updateOrderStatusSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  await db
    .update(orders)
    .set({
      status: parsed.data.status,
      adminNotes: parsed.data.adminNotes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))

  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await db.delete(orders).where(eq(orders.id, id))

  return NextResponse.json({ success: true })
}
