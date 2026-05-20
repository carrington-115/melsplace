"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from "lucide-react"

interface PaymentResultHandlerProps {
  orderId: string
  paymentStatus: string
  fulfillmentType: string
}

export function PaymentResultHandler({
  orderId,
  paymentStatus,
  fulfillmentType,
}: PaymentResultHandlerProps) {
  const searchParams = useSearchParams()
  const paymentResult = searchParams.get("payment_result")
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    if (paymentResult === "success") {
      toast.success("Payment successful!", {
        description: "Your order has been confirmed.",
      })
    } else if (paymentResult === "cancelled") {
      toast.warning("Payment cancelled", {
        description: "Complete payment below to confirm your order.",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canRetryPayment =
    fulfillmentType === "delivery" &&
    (paymentStatus === "unpaid" || paymentStatus === "pending" || paymentStatus === "failed")

  if (!canRetryPayment) return null

  const handleCompletePayment = async () => {
    setRetrying(true)
    try {
      const res = await fetch("/api/checkout/square", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Could not start payment")
        return
      }
      const { checkoutUrl } = await res.json()
      window.location.href = checkoutUrl
    } catch {
      toast.error("Something went wrong")
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 mb-6">
      <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-3">
        Payment required to confirm this order.
      </p>
      <Button onClick={handleCompletePayment} disabled={retrying} className="gap-2" size="sm">
        {retrying ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        {retrying ? "Redirecting…" : "Complete Payment"}
      </Button>
    </div>
  )
}
