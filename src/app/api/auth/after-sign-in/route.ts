import { auth, clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: Request) {
  const baseUrl = new URL(request.url).origin
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", baseUrl))
  }

  // DB is the authoritative source — check it first
  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1)

  if (dbUser?.role === "admin") {
    return NextResponse.redirect(new URL("/dashboard", baseUrl))
  }

  // Webhook may not have fired yet on first sign-in — fall back to Clerk metadata
  try {
    const clerk = await clerkClient()
    const freshUser = await clerk.users.getUser(userId)
    const freshRole = (freshUser.publicMetadata as { role?: string })?.role
    if (freshRole === "admin") {
      return NextResponse.redirect(new URL("/dashboard", baseUrl))
    }
  } catch {
    // Can't reach Clerk — fall through to customer redirect
  }

  return NextResponse.redirect(new URL("/products", baseUrl))
}
