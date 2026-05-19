import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  categoryId: z.string().uuid("Invalid category").optional().nullable(),
  description: z.string().optional().nullable(),
  manufacturer: z.string().optional().nullable(),
  warrantyInfo: z.string().optional().nullable(),
  originCountry: z.string().optional().nullable(),
  weightGrams: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int().positive().optional()
  ),
  price: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .multipleOf(0.01),
  compareAtPrice: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().positive().multipleOf(0.01).optional()
  ),
  inventory: z.coerce.number().int().min(0, "Inventory cannot be negative"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
})

export type ProductFormValues = z.infer<typeof productSchema>

export const promotionSchema = z.object({
  productId: z.string().uuid().optional().nullable(),
  label: z.string().min(1, "Label is required"),
  discountType: z.enum(["percentage", "fixed", "bogo"]),
  discountValue: z.coerce.number().positive("Discount value must be positive"),
  startsAt: z.string().min(1, "Start date is required"),
  endsAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export type PromotionFormValues = z.infer<typeof promotionSchema>

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).default(0),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
