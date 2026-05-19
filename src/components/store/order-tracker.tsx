import { Check, Package, Truck, Store, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const DELIVERY_STEPS = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "processing", label: "Processing", icon: Package },
  { key: "ready", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
]

const PICKUP_STEPS = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "processing", label: "Preparing", icon: Package },
  { key: "ready", label: "Ready for Pickup", icon: Store },
  { key: "delivered", label: "Picked Up", icon: CheckCircle2 },
]

const STATUS_ORDER = [
  "pending",
  "confirmed",
  "processing",
  "ready",
  "delivered",
]

interface OrderTrackerProps {
  status: string
  fulfillmentType: string
}

export function OrderTracker({ status, fulfillmentType }: OrderTrackerProps) {
  if (status === "cancelled") {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
        <p className="text-destructive font-medium">This order has been cancelled.</p>
      </div>
    )
  }

  const steps =
    fulfillmentType === "pickup" ? PICKUP_STEPS : DELIVERY_STEPS
  const currentIndex = STATUS_ORDER.indexOf(status)

  return (
    <div className="relative">
      {/* Track line */}
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
      <div
        className="absolute top-5 left-5 h-0.5 bg-primary transition-all duration-500"
        style={{
          width:
            currentIndex <= 0
              ? "0%"
              : `${(currentIndex / (steps.length - 1)) * 100}%`,
        }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, i) => {
          const Icon = step.icon
          const isComplete = i < currentIndex
          const isCurrent = i === currentIndex

          return (
            <div
              key={step.key}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                  isComplete
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCurrent
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-background border-border text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center leading-tight",
                  isComplete || isCurrent
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
