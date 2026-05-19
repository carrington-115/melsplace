"use client"

import { useState, useEffect } from "react"
import { Search, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductSheet } from "@/components/admin/product-sheet"
import { formatPrice } from "@/lib/utils"
import type { ProductWithDetails } from "@/types"
import Image from "next/image"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<ProductWithDetails | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const fetchProducts = () => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts()
    window.addEventListener("product-added", fetchProducts)
    window.addEventListener("product-updated", fetchProducts)
    return () => {
      window.removeEventListener("product-added", fetchProducts)
      window.removeEventListener("product-updated", fetchProducts)
    }
  }, [])

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (product: ProductWithDetails) => {
    setSelected(product)
    setSheetOpen(true)
  }

  const handleDeleted = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleUpdated = (updated: ProductWithDetails) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setSelected(updated)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-muted-foreground">{products.length} products</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Category</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Inventory</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden md:table-cell">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Skeleton className="h-4 w-10 mx-auto" />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell" />
                  </tr>
                ))
              : filtered.map((product) => {
                  const img = product.images?.[0]?.url
                  const isLow = product.inventory <= 5 && product.inventory > 0
                  const isOut = product.inventory === 0
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-muted/30 cursor-pointer transition-colors ${isOut ? "bg-destructive/5" : isLow ? "bg-amber-50/50 dark:bg-amber-950/10" : ""}`}
                      onClick={() => handleSelect(product)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                            {img ? (
                              <Image src={img} alt={product.name} fill className="object-cover" sizes="40px" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-sm">🌍</div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.manufacturer && (
                              <p className="text-xs text-muted-foreground">{product.manufacturer}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {product.category?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatPrice(Number(product.price))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isOut && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                          {isLow && !isOut && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                          <span className={isOut ? "text-destructive font-medium" : isLow ? "text-amber-600 font-medium" : ""}>
                            {product.inventory}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        <Badge
                          variant={product.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No products found
          </div>
        )}
      </div>

      <ProductSheet
        product={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onDeleted={handleDeleted}
        onUpdated={handleUpdated}
      />
    </div>
  )
}
