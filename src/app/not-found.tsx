import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl mb-6">🌍</div>
      <h1 className="text-4xl font-bold mb-3">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        This page has wandered off the savanna. Let&apos;s get you back to the market.
      </p>
      <Button asChild>
        <Link href="/products" className="gap-2">
          <ShoppingBag className="h-4 w-4" />
          Browse Products
        </Link>
      </Button>
    </div>
  )
}
