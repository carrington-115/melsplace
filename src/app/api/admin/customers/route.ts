import { NextResponse } from "next/server"
import { db, users } from "@/db"
import { eq } from "drizzle-orm"
import { requireAdmin } from "@/lib/require-admin"

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const customerList = await db.query.users.findMany({
    where: eq(users.role, "customer"),
    orderBy: (u, { desc }) => [desc(u.createdAt)],
    with: { orders: true },
  })

  return NextResponse.json({ customers: customerList })
}
