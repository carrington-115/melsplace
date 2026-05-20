"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AddPromotionDialog } from "@/components/admin/add-promotion-dialog"
import { Plus, Trash2 } from "lucide-react"
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
import { toast } from "sonner"
import type { Promotion } from "@/types"

type PromotionWithProduct = Promotion & { product: { name: string } | null }

export default function PromotionsPage() {
  const [promos, setPromos] = useState<PromotionWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PromotionWithProduct | null>(null)
  const [deleting, setDeleting] = useState(false)

  function fetchPromos() {
    setLoading(true)
    fetch("/api/admin/promotions")
      .then((r) => r.json())
      .then((d) => setPromos(d.promotions ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPromos()
  }, [])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/promotions/${deleteTarget.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      setPromos((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      toast.success("Promotion deleted")
    } catch {
      toast.error("Failed to delete promotion")
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Promotions</h1>
        <Button size="sm" className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Promotion
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Label</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Product</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Discount</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden md:table-cell">Ends</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : promos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{promo.label}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {promo.product?.name ?? <span className="italic">Store-wide</span>}
                    </td>
                    <td className="px-4 py-3">
                      {promo.discountType === "percentage"
                        ? `${promo.discountValue}% off`
                        : promo.discountType === "fixed"
                          ? `$${promo.discountValue} off`
                          : "BOGO"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={promo.isActive ? "default" : "secondary"}>
                        {promo.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">
                      {promo.endsAt
                        ? new Date(promo.endsAt).toLocaleDateString()
                        : "No end date"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteTarget(promo)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && promos.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No promotions yet.
          </div>
        )}
      </div>

      <AddPromotionDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={fetchPromos} />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete promotion?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the <strong>{deleteTarget?.label}</strong> promotion. Products
              currently showing this promotion badge will no longer display it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
