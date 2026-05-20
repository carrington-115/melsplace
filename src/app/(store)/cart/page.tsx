import type { Metadata } from "next"
import { CartClient } from "./cart-client"

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return <CartClient />
}
