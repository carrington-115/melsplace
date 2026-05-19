"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/store/product-card"
import type { ProductWithCategory, Promotion } from "@/types"

interface StorePreviewSectionProps {
  products: (ProductWithCategory & { promotions?: Promotion[] })[]
}

export function StorePreviewSection({ products }: StorePreviewSectionProps) {
  return (
    <section id="store-preview" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-widest mb-3">
              Online Store
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Shop our collection
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline shrink-0"
          >
            View all products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border bg-muted/30 flex flex-col items-center justify-center py-20 text-center gap-3">
            <span className="text-5xl">🌍</span>
            <p className="text-muted-foreground font-medium">
              Products coming soon — check back shortly.
            </p>
            <Link
              href="/products"
              className="text-sm text-primary font-semibold hover:underline"
            >
              Browse the store
            </Link>
          </div>
        )}

        {/* Bottom CTA */}
        {products.length > 0 && (
          <div className="text-center mt-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Explore all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
