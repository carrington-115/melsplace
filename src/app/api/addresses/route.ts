import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db, users, addresses } from "@/db"
import { eq } from "drizzle-orm"
import { addressSchema } from "@/lib/validations/user"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, userId) })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await req.json()
  const parsed = addressSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const [address] = await db
    .insert(addresses)
    .values({ userId: user.id, ...parsed.data })
    .returning()

  return NextResponse.json({ address })
}
