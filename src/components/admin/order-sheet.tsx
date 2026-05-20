"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, Store, User, Mail, Phone } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { OrderStatusBadge } from "@/components/store/order-status-badge"
import { toast } from "sonner"
import { formatPrice } from "@/lib/utils"
import type { OrderWithItems } from "@/types"

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  unpaid: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  refunded: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
}

function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${PAYMENT_STATUS_STYLES[status] ?? ""}`}
    >
      {status}
    </span>
  )
}

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "ready", label: "Ready" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

interface OrderSheetProps {
  order: OrderWithItems | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: (orderId: string, status: string) => void
}

export function OrderSheet({
  order,
  open,
  onOpenChange,
  onUpdated,
}: OrderSheetProps) {
  const [status, setStatus] = useState(order?.status ?? "pending")
  const [adminNotes, setAdminNotes] = useState(order?.adminNotes ?? "")
  const [saving, setSaving] = useState(false)

  if (!order) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      })
      if (!res.ok) throw new Error("Failed to update")
      toast.success("Order updated")
      onUpdated?.(order.id, status)
    } catch {
      toast.error("Failed to update order")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="text-left">{order.orderNumber}</SheetTitle>
            <div className="flex items-center gap-2 shrink-0">
              <PaymentStatusBadge status={order.paymentStatus} />
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
        </SheetHeader>

        {/* Customer info */}
        <div className="rounded-xl border p-4 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Customer
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium">{order.user.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={`mailto:${order.user.email}`} className="hover:text-primary transition-colors">
                {order.user.email}
              </a>
            </div>
            {order.user.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`tel:${order.user.phone}`} className="hover:text-primary transition-colors">
                  {order.user.phone}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Fulfillment */}
        <div className="rounded-xl border p-4 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Fulfillment
          </p>
          {order.fulfillmentType === "pickup" ? (
            <div className="flex items-center gap-2 text-sm">
              <Store className="h-4 w-4 text-primary" />
              <span>In-Store Pickup — Charlotte, NC</span>
            </div>
          ) : order.shippingAddress ? (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p>{order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}</p>
                <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No address provided.</p>
          )}
        </div>

        {/* Order items */}
        <div className="rounded-xl border mb-4">
          <div className="px-4 py-3 border-b">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Items ({order.items.length})
            </p>
          </div>
          <div className="divide-y">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-3 p-4">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                  {item.productImageUrl ? (
                    <Image src={item.productImageUrl} alt={item.productName} fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-lg">🌍</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(Number(item.unitPrice))} × {item.quantity}</p>
                </div>
                <span className="font-semibold text-sm shrink-0">{formatPrice(Number(item.totalPrice))}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t bg-muted/30 text-sm font-bold flex justify-between">
            <span>Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </div>
        </div>

        {/* Customer notes */}
        {order.customerNotes && (
          <div className="rounded-lg bg-muted/50 p-3 mb-4 text-sm">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Customer Note</p>
            <p>{order.customerNotes}</p>
          </div>
        )}

        <Separator className="mb-4" />

        {/* Status update */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Update Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Admin Notes <span className="text-muted-foreground font-normal text-xs">(visible to customer)</span></Label>
            <Textarea
              className="resize-none h-20 text-sm"
              placeholder="e.g. Ready for pickup at 3pm Thursday…"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
