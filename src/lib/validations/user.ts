import { z } from "zod"

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,15}$/, "Invalid phone number")
    .optional()
    .nullable(),
})

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>

export const addressSchema = z.object({
  label: z.string().min(1, "Label required").default("Home"),
  line1: z.string().min(5, "Street address required"),
  line2: z.string().optional().nullable(),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  isDefault: z.boolean().default(false),
})

export type AddressFormValues = z.infer<typeof addressSchema>
