"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

const MESSAGES = [
  "🌍 Authentic African flavors delivered to your door — Charlotte, NC & beyond",
  "✨ Free delivery on orders over $75",
  "🛒 New products added weekly — check out our latest arrivals",
  "📦 In-store pickup available at our Charlotte location",
]

export function PromotionBanner() {
  const [visible, setVisible] = useState(true)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  if (!visible) return null

  return (
    <div className="bg-primary text-primary-foreground text-sm py-2 px-4 flex items-center justify-between">
      <div className="flex-1 text-center font-medium transition-all duration-300">
        {MESSAGES[index]}
      </div>
      <button
        onClick={() => setVisible(false)}
        className="ml-4 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
