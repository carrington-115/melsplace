import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/require-admin"

export async function POST(request: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  const productId = formData.get("productId") as string | null

  if (!file || !productId) {
    return NextResponse.json({ error: "Missing file or productId" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()
  const path = `${productId}/${Date.now()}.${ext}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const supabase = createServerSupabaseClient()
  const { error } = await supabase.storage
    .from("products")
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = supabase.storage.from("products").getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
