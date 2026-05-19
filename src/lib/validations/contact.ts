import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000),
  type: z.enum(["general", "fraud", "bug"]).default("general"),
  orderNumber: z.string().optional().nullable(),
  pageAffected: z.string().optional().nullable(),
  browserInfo: z.string().optional().nullable(),
})

export type ContactFormValues = z.infer<typeof contactSchema>
