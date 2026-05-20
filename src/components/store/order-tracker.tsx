import { Check, Package, Truck, Store, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const DELIVERY_STEPS = [
  {
    key: "pending",
    label: "Order Placed",
    icon: Package,
    description: "We've received your order and are reviewing it.",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: Check,
    description: "Your order is confirmed and being prepared.",
  },
  {
    key: "processing",
    label: "Processing",
    icon: Package,
    description: "Your items are being packed and prepared for shipment.",
  },
  {
    key: "ready",
    label: "Out for Delivery",
    icon: Truck,
    description: "Your order is on its way!",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: CheckCircle2,
    description: "Your order has been delivered. Enjoy!",
  },
]

const PICKUP_STEPS = [
  {
    key: "pending",
    label: "Order Placed",
    icon: Package,
    description: "We've received your order and are reviewing it.",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: Check,
    description: "Your order is confirmed.",
  },
  {
    key: "processing",
    label: "Preparing",
    icon: Package,
    description: "Your items are being picked and packed.",
  },
  {
    key: "ready",
    label: "Ready for Pickup",
    icon: Store,
    description: "Your order is ready! Come pick it up at Mel's Place.",
  },
  {
    key: "delivered",
    label: "Picked Up",
    icon: CheckCircle2,
    description: "Order complete. Thank you for shopping with us!",
  },
]

const STATUS_ORDER = ["pending", "confirmed", "processing", "ready", "delivered"]

interface OrderTrackerProps {
  status: string
  fulfillmentType: string
}

export function OrderTracker({ status, fulfillmentType }: OrderTrackerProps) {
  if (status === "cancelled") {
    return (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <XCircle className="h-10 w-10 text-destructive" />
        <div>
          <p className="font-semibold text-destructive">Order Cancelled</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            This order has been cancelled. Contact us if you have questions.
          </p>
        </div>
      </div>
    )
  }

  const steps = fulfillmentType === "pickup" ? PICKUP_STEPS : DELIVERY_STEPS
  const currentIndex = STATUS_ORDER.indexOf(status)
  const currentStep = steps[currentIndex]

  // Track spans from center of step 0 to center of step n-1.
  // With n flex-1 items, step i center = (2i+1)/(2n) * 100%.
  // n=5: step 0 = 10%, step 4 = 90%. Track: left-[10%] right-[10%].
  // Progress width at step i = (i / (n-1)) * 80% of container.
  const n = steps.length
  const trackStart = `${100 / (2 * n)}%`
  const trackEnd = `${100 / (2 * n)}%`
  const progressWidth =
    currentIndex <= 0
      ? "0%"
      : `${(currentIndex / (n - 1)) * (100 - 100 / n)}%`

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="relative">
        {/* Background track */}
        <div
          className="absolute top-5 h-0.5 bg-border"
          style={{ left: trackStart, right: trackEnd }}
        />
        {/* Filled progress */}
        <div
          className="absolute top-5 h-0.5 bg-primary transition-all duration-700 ease-in-out"
          style={{ left: trackStart, width: progressWidth }}
        />

        {/* Steps */}
        <div className="relative flex">
          {steps.map((step, i) => {
            const Icon = step.icon
            const isComplete = i < currentIndex
            const isCurrent = i === currentIndex

            return (
              <div key={step.key} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                    isComplete
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-primary/10 border-primary text-primary shadow-[0_0_0_4px] shadow-primary/10"
                        : "bg-background border-border text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium text-center leading-tight px-1",
                    isComplete || isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current status description */}
      {currentStep && (
        <div className="rounded-lg bg-muted/50 px-4 py-3 text-center">
          <p className="text-sm font-medium text-foreground">{currentStep.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{currentStep.description}</p>
        </div>
      )}
    </div>
  )
}
