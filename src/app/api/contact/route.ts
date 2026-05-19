import { NextResponse } from "next/server"
import { db, contactSubmissions } from "@/db"
import { sendContactNotification } from "@/lib/resend"
import { contactSchema } from "@/lib/validations/contact"

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = contactSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data

  await db.insert(contactSubmissions).values({
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    type: data.type,
  })

  try {
    await sendContactNotification({
      name: data.name,
      email: data.email,
      subject: data.subject,
      type: data.type,
      message: data.message,
    })
  } catch (err) {
    console.error("Failed to send contact notification:", err)
  }

  return NextResponse.json({ success: true })
}
