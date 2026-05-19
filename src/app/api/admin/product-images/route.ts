import { NextResponse } from "next/server"
import { db, productImages } from "@/db"
import { requireAdmin } from "@/lib/require-admin"

export async function POST(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { productId, url, position } = await req.json()
  const [image] = await db
    .insert(productImages)
    .values({ productId, url, position: position ?? 0 })
    .returning()

  return NextResponse.json({ image })
}
