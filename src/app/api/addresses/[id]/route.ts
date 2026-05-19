import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db, users, addresses } from "@/db"
import { and, eq } from "drizzle-orm"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.query.users.findFirst({ where: eq(users.clerkId, userId) })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db
    .delete(addresses)
    .where(and(eq(addresses.id, id), eq(addresses.userId, user.id)))

  return NextResponse.json({ success: true })
}
