import type {
  User,
  Address,
  Category,
  Product,
  ProductImage,
  Promotion,
  WishlistItem,
  CartItem,
  Order,
  OrderItem,
  Faq,
} from "@/db/schema"

// ─── Rich types with relations ────────────────────────────────────────────────

export type ProductWithDetails = Product & {
  category: Category | null
  images: ProductImage[]
  promotions: Promotion[]
}

export type ProductWithCategory = Product & {
  category: Category | null
  images: ProductImage[]
}

export type CartItemWithProduct = CartItem & {
  product: ProductWithCategory
}

export type OrderWithItems = Order & {
  items: OrderItem[]
  user: User
  shippingAddress: Address | null
}

export type WishlistItemWithProduct = WishlistItem & {
  product: ProductWithCategory
}

// ─── Cart state ───────────────────────────────────────────────────────────────

export interface CartState {
  items: LocalCartItem[]
  addItem: (product: ProductWithCategory, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

export interface LocalCartItem {
  productId: string
  quantity: number
  product: ProductWithCategory
}

// ─── Wishlist state ───────────────────────────────────────────────────────────

export interface WishlistState {
  productIds: string[]
  toggle: (productId: string) => void
  isWishlisted: (productId: string) => boolean
}

// ─── Order status helpers ─────────────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export const ORDER_STATUS_STEPS = [
  "pending",
  "confirmed",
  "processing",
  "ready",
  "delivered",
] as const

// ─── Re-exports from schema ───────────────────────────────────────────────────

export type {
  User,
  Address,
  Category,
  Product,
  ProductImage,
  Promotion,
  WishlistItem,
  CartItem,
  Order,
  OrderItem,
  Faq,
}
