import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Webhook } from "svix"
import { clerkClient } from "@clerk/nextjs/server"
import { db, users } from "@/db"
import { eq } from "drizzle-orm"

// ─── Email allowlist ──────────────────────────────────────────────────────────
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface ClerkUserData {
  id: string
  email_addresses: Array<{ email_address: string; id: string }>
  primary_email_address_id: string
  first_name: string | null
  last_name: string | null
  image_url: string
  public_metadata: { role?: string }
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    )
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: { type: string; data: ClerkUserData }

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: ClerkUserData }
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const { type, data } = evt

  if (type === "user.created" || type === "user.updated") {
    const primaryEmail = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id
    )?.email_address

    if (!primaryEmail) {
      return NextResponse.json({ error: "No email found" }, { status: 400 })
    }

    // ── Email allowlist enforcement ─────────────────────────────────────────
    if (type === "user.created" && !isEmailAllowed(primaryEmail)) {
      try {
        const clerk = await clerkClient()
        await clerk.users.deleteUser(data.id)
        console.log(`[webhook] Deleted unauthorized user: ${primaryEmail}`)
      } catch (err) {
        console.error("[webhook] Failed to delete unauthorized user:", err)
      }
      return NextResponse.json({ received: true })
    }

    const name =
      [data.first_name, data.last_name].filter(Boolean).join(" ") ||
      primaryEmail.split("@")[0]

    // Compute role from email — admin emails are those on the allowlist
    const computedRole: "admin" | "customer" = isEmailAllowed(primaryEmail)
      ? "admin"
      : "customer"

    // On create: set role in Clerk public metadata so it propagates to JWT tokens
    // On update: preserve existing role unless it's being explicitly set
    const role: "admin" | "customer" =
      type === "user.created"
        ? computedRole
        : ((data.public_metadata?.role as "admin" | "customer") ?? computedRole)

    if (type === "user.created" || data.public_metadata?.role !== role) {
      try {
        const clerk = await clerkClient()
        await clerk.users.updateUserMetadata(data.id, {
          publicMetadata: {
            ...data.public_metadata,
            role,
            email: primaryEmail,
          },
        })
      } catch (err) {
        console.error("[webhook] Failed to set role metadata:", err)
      }
    }

    await db
      .insert(users)
      .values({
        clerkId: data.id,
        email: primaryEmail,
        name,
        avatarUrl: data.image_url,
        role,
      })
      .onConflictDoUpdate({
        target: users.clerkId,
        set: {
          email: primaryEmail,
          name,
          avatarUrl: data.image_url,
          role,
          updatedAt: new Date(),
        },
      })
  }

  if (type === "user.deleted") {
    await db.delete(users).where(eq(users.clerkId, data.id))
  }

  return NextResponse.json({ received: true })
}
