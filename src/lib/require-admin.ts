import { auth, clerkClient } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { users } from "@/db/schema"

export async function requireAdmin(): Promise<string | null> {
  const { userId, sessionClaims } = await auth()
  if (!userId) return null

  const jwtRole = (sessionClaims?.metadata as { role?: string } | undefined)
    ?.role
  if (jwtRole === "admin") return userId

  // JWT may be stale — fetch fresh metadata from Clerk
  try {
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const freshRole = (user.publicMetadata as { role?: string })?.role
    if (freshRole === "admin") return userId
  } catch {
    // Clerk unreachable — fall through to DB
  }

  // DB is the authoritative source (same pattern as after-sign-in).
  // Catches cases where Clerk metadata update silently failed at webhook time.
  try {
    const [dbUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)
    if (dbUser?.role === "admin") return userId
  } catch {
    // DB unreachable — deny
  }

  return null
}
