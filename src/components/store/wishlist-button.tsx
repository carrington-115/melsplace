"use client"

import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWishlistStore } from "@/hooks/use-wishlist"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface WishlistButtonProps {
  productId: string
  productName: string
  className?: string
  size?: "sm" | "default"
}

export function WishlistButton({
  productId,
  productName,
  className,
  size = "sm",
}: WishlistButtonProps) {
  const { toggle, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(productId)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(productId)
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist", {
      description: productName,
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full transition-all",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        className
      )}
      onClick={handleToggle}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "transition-all",
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          wishlisted ? "fill-primary stroke-primary" : "stroke-current"
        )}
      />
    </Button>
  )
}
