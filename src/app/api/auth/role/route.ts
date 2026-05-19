import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db, users } from "@/db"
import { eq } from "drizzle-orm"

const ALLOWED_EMAILS = new Set([
  "frumarkcarrington@gmail.com",
  "melvisfri@gmail.com",
])
const ALLOWED_DOMAINS = new Set(["melsplaceonline.com"])

function isEmailAllowed(email: string): boolean {
  const lower = email.toLowerCase()
  if (ALLOWED_EMAILS.has(lower)) return true
  const domain = lower.split("@")[1]
  return domain ? ALLOWED_DOMAINS.has(domain) : false
}

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ role: null })
  }

  const [dbUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1)

  if (dbUser) {
    return NextResponse.json({ role: dbUser.role })
  }

  // Guard: webhook may have failed — check email and upsert if allowed
  try {
    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(userId)
    const primaryEmail = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress

    if (primaryEmail && isEmailAllowed(primaryEmail)) {
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        primaryEmail.split("@")[0]

      await db
        .insert(users)
        .values({
          clerkId: userId,
          email: primaryEmail,
          name,
          avatarUrl: clerkUser.imageUrl,
          role: "admin",
        })
        .onConflictDoUpdate({
          target: users.clerkId,
          set: { role: "admin", updatedAt: new Date() },
        })

      return NextResponse.json({ role: "admin" })
    }
  } catch {
    // If Clerk lookup fails, default to customer — middleware still enforces access
  }

  return NextResponse.json({ role: "customer" })
}
