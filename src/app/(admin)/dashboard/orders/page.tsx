"use client"

import { useState, useEffect } from "react"
import { Search, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderStatusBadge } from "@/components/store/order-status-badge"
import { OrderSheet } from "@/components/admin/order-sheet"
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
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"
import type { OrderWithItems } from "@/types"

export default function AdminOrdersPage() {
  const [allOrders, setAllOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<OrderWithItems | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OrderWithItems | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setAllOrders(d.orders ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = allOrders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.user.name.toLowerCase().includes(search.toLowerCase()) ||
      o.user.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleOrderUpdated = (orderId: string, status: string) => {
    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: status as OrderWithItems["status"] } : o))
    )
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/orders/${deleteTarget.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error()
      setAllOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id))
      if (selected?.id === deleteTarget.id) {
        setSheetOpen(false)
        setSelected(null)
      }
      toast.success("Order deleted")
    } catch {
      toast.error("Failed to delete order")
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">{allOrders.length} total</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders or customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Type</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground hidden sm:table-cell">Date</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td
                      className="px-4 py-3 cursor-pointer"
                      onClick={() => { setSelected(order); setSheetOpen(true) }}
                    >
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                    </td>
                    <td
                      className="px-4 py-3 hidden md:table-cell cursor-pointer"
                      onClick={() => { setSelected(order); setSheetOpen(true) }}
                    >
                      <p className="font-medium">{order.user.name}</p>
                      <p className="text-xs text-muted-foreground">{order.user.email}</p>
                    </td>
                    <td
                      className="px-4 py-3 text-muted-foreground capitalize hidden lg:table-cell cursor-pointer"
                      onClick={() => { setSelected(order); setSheetOpen(true) }}
                    >
                      {order.fulfillmentType}
                    </td>
                    <td
                      className="px-4 py-3 text-center cursor-pointer"
                      onClick={() => { setSelected(order); setSheetOpen(true) }}
                    >
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td
                      className="px-4 py-3 text-right font-medium cursor-pointer"
                      onClick={() => { setSelected(order); setSheetOpen(true) }}
                    >
                      {formatPrice(Number(order.total))}
                    </td>
                    <td
                      className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell cursor-pointer"
                      onClick={() => { setSelected(order); setSheetOpen(true) }}
                    >
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(order) }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            No orders found
          </div>
        )}
      </div>

      <OrderSheet
        key={selected?.id}
        order={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUpdated={handleOrderUpdated}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete order <strong>{deleteTarget?.orderNumber}</strong>. This action
              cannot be undone.
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
