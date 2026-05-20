import { NextResponse } from "next/server"
import { db, promotions } from "@/db"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/lib/require-admin"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  await db.delete(promotions).where(eq(promotions.id, id))

  return NextResponse.json({ success: true })
}
