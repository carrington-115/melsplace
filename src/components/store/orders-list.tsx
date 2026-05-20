"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Store, Truck, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { OrderStatusBadge } from "@/components/store/order-status-badge"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

interface OrderItem {
  id: string
  productName: string
  productImageUrl: string | null
}

interface Order {
  id: string
  orderNumber: string
  status: string
  fulfillmentType: string
  total: string | number
  createdAt: Date | string
  items: OrderItem[]
}

interface OrdersListProps {
  orders: Order[]
}

const CANCELLABLE_STATUSES = ["pending", "confirmed"]

export function OrdersList({ orders: initialOrders }: OrdersListProps) {
  const [orderList, setOrderList] = useState(initialOrders)
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)
  const [cancelling, setCancelling] = useState(false)

  async function handleCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/orders/${cancelTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Failed to cancel order")
        return
      }
      setOrderList((prev) =>
        prev.map((o) =>
          o.id === cancelTarget.id ? { ...o, status: "cancelled" } : o
        )
      )
      toast.success("Order cancelled", {
        description: `${cancelTarget.orderNumber} has been cancelled.`,
      })
    } catch {
      toast.error("Something went wrong")
    } finally {
      setCancelling(false)
      setCancelTarget(null)
    }
  }

  return (
    <>
      <div className="space-y-3">
        {orderList.map((order) => {
          const imageItems = order.items.filter((i) => i.productImageUrl).slice(0, 3)
          const remainingCount = order.items.length - imageItems.length
          const canCancel = CANCELLABLE_STATUSES.includes(order.status)

          return (
            <div key={order.id} className="rounded-xl border bg-card hover:shadow-md transition-shadow group">
              {/* Clickable top area */}
              <Link href={`/orders/${order.id}`} className="block px-4 pt-4 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{order.orderNumber}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-semibold text-sm">
                      {formatPrice(Number(order.total))}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>

              {/* Bottom row: thumbnails + fulfillment + cancel */}
              <div className="flex items-center justify-between gap-4 px-4 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {imageItems.map((item) => (
                      <div
                        key={item.id}
                        className="relative w-9 h-9 rounded-lg overflow-hidden bg-muted border-2 border-background shrink-0"
                      >
                        <Image
                          src={item.productImageUrl!}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="36px"
                        />
                      </div>
                    ))}
                    {remainingCount > 0 && (
                      <div className="w-9 h-9 rounded-lg bg-muted border-2 border-background flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0">
                        +{remainingCount}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {order.fulfillmentType === "pickup" ? (
                      <><Store className="h-3.5 w-3.5" /> In-store pickup</>
                    ) : (
                      <><Truck className="h-3.5 w-3.5" /> Delivery</>
                    )}
                  </div>

                  {canCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                      onClick={() => setCancelTarget(order)}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => { if (!open) setCancelTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              Order <strong>{cancelTarget?.orderNumber}</strong> will be marked as cancelled.
              Once an order is being processed, it can no longer be cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? "Cancelling…" : "Yes, Cancel Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
