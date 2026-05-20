import { z } from "zod"

export const placeOrderSchema = z.object({
  fulfillmentType: z.enum(["delivery", "pickup"]),
  shippingAddressId: z.string().uuid().optional().nullable(),
  customerNotes: z.string().max(500).optional().nullable(),
  newAddress: z
    .object({
      label: z.string().optional().default("Home"),
      line1: z.string().min(5, "Street address required"),
      line2: z.string().optional().nullable(),
      city: z.string().min(2),
      state: z.string().min(2),
      zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
      saveAddress: z.boolean().default(false),
    })
    .optional()
    .nullable(),
})

export type PlaceOrderValues = z.infer<typeof placeOrderSchema>

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "ready",
    "delivered",
    "cancelled",
  ]),
  adminNotes: z.string().max(1000).optional().nullable(),
})

export type UpdateOrderStatusValues = z.infer<typeof updateOrderStatusSchema>
