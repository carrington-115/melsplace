import { NextResponse } from "next/server"
import { db, productImages } from "@/db"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/lib/require-admin"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params

  const [image] = await db
    .select()
    .from(productImages)
    .where(eq(productImages.id, id))
    .limit(1)

  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await db.delete(productImages).where(eq(productImages.id, id))

  const match = image.url.match(/\/storage\/v1\/object\/public\/products\/(.+)$/)
  if (match?.[1]) {
    const supabase = createServerSupabaseClient()
    await supabase.storage.from("products").remove([match[1]])
  }

  return NextResponse.json({ success: true })
}
