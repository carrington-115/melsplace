"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Edit, Trash2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import { EditProductDialog } from "@/components/admin/edit-product-dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { formatPrice } from "@/lib/utils"
import type { ProductWithDetails } from "@/types"

interface ProductSheetProps {
  product: ProductWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: (productId: string) => void
  onUpdated?: (updated: ProductWithDetails) => void
}

export function ProductSheet({
  product,
  open,
  onOpenChange,
  onDeleted,
  onUpdated,
}: ProductSheetProps) {
  const [imgIndex, setImgIndex] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => { setImgIndex(0) }, [product?.id])

  if (!product) return null

  const images = product.images ?? []
  const activePromo = product.promotions?.find((p) => p.isActive)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Product deleted")
      onDeleted?.(product.id)
      onOpenChange(false)
    } catch {
      toast.error("Failed to delete product")
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-left">{product.name}</SheetTitle>
          </SheetHeader>

          {/* Image carousel */}
          {images.length > 0 && (
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-4">
              <Image
                src={images[imgIndex]?.url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="480px"
              />
              {images.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="secondary"
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80"
                    onClick={() =>
                      setImgIndex((i) => (i - 1 + images.length) % images.length)
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80"
                    onClick={() =>
                      setImgIndex((i) => (i + 1) % images.length)
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        aria-label={`View image ${i + 1}`}
                        onClick={() => setImgIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === imgIndex
                            ? "bg-primary scale-125"
                            : "bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.category && (
              <Badge variant="secondary">{product.category.name}</Badge>
            )}
            {activePromo && (
              <Badge>{activePromo.label}</Badge>
            )}
            {!product.isActive && (
              <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
            )}
            {product.isFeatured && (
              <Badge variant="secondary">⭐ Featured</Badge>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-end gap-3 mb-4">
            <span className="text-2xl font-bold">
              {formatPrice(Number(product.price))}
            </span>
            {product.compareAtPrice && (
              <span className="text-muted-foreground line-through mb-0.5">
                {formatPrice(Number(product.compareAtPrice))}
              </span>
            )}
          </div>

          <Separator className="mb-4" />

          {/* Details table */}
          <div className="rounded-lg border overflow-hidden mb-4">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Inventory", product.inventory <= 5 && product.inventory > 0
                    ? <span className="text-amber-600 font-medium">{product.inventory} (low)</span>
                    : product.inventory === 0
                      ? <span className="text-destructive font-medium">Out of stock</span>
                      : product.inventory,
                  ],
                  ["Manufacturer", product.manufacturer],
                  ["Origin", product.originCountry],
                  ["Weight", product.weightGrams ? `${product.weightGrams}g` : null],
                  ["Warranty", product.warrantyInfo],
                ].filter(([, v]) => v != null).map(([label, value]) => (
                  <tr key={String(label)} className="border-b last:border-0">
                    <td className="px-3 py-2.5 text-muted-foreground bg-muted/30 font-medium w-1/3 text-xs">
                      {label}
                    </td>
                    <td className="px-3 py-2.5 text-sm">{value as React.ReactNode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Active promotion */}
          {activePromo && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 p-3 mb-4 text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                Active Promotion: {activePromo.label}
              </p>
              <p className="text-amber-600 dark:text-amber-400 text-xs">
                {activePromo.discountType === "percentage"
                  ? `${activePromo.discountValue}% off`
                  : activePromo.discountType === "fixed"
                    ? `$${activePromo.discountValue} off`
                    : "Buy One Get One"}
              </p>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                Description
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <Separator className="mb-4" />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => setEditOpen(true)}
            >
              <Edit className="h-4 w-4" />
              Edit Product
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <EditProductDialog
        product={product}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={(updated) => onUpdated?.(updated)}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Product?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{product.name}</strong> and all its images. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
