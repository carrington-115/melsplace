import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db, users } from "@/db"
import { eq } from "drizzle-orm"
import { updateProfileSchema } from "@/lib/validations/user"

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  await db
    .update(users)
    .set({ name: parsed.data.name, phone: parsed.data.phone ?? null, updatedAt: new Date() })
    .where(eq(users.clerkId, userId))

  return NextResponse.json({ success: true })
}
