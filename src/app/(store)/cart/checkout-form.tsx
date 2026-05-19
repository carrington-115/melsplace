"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MapPin, Store, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useCartStore } from "@/hooks/use-cart"
import { toast } from "sonner"
import { placeOrderSchema, type PlaceOrderValues } from "@/lib/validations/order"
import { cn } from "@/lib/utils"

interface CheckoutFormProps {
  subtotal: number
  tax: number
  shipping: number
  total: number
}

export function CheckoutForm({ subtotal, tax, shipping, total }: CheckoutFormProps) {
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)

  const form = useForm<PlaceOrderValues>({
    resolver: zodResolver(placeOrderSchema) as Resolver<PlaceOrderValues>,
    defaultValues: {
      fulfillmentType: "delivery",
      customerNotes: "",
    },
  })

  const fulfillmentType = form.watch("fulfillmentType")

  async function onSubmit(values: PlaceOrderValues) {
    setLoading(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            productName: i.product.name,
            productImageUrl: i.product.images?.[0]?.url ?? null,
            unitPrice: Number(i.product.price),
          })),
          subtotal,
          tax,
          shipping,
          total,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to place order")
      }

      const { orderId } = await res.json()
      clearCart()
      toast.success("Order placed!", {
        description: "We'll be in touch shortly to confirm your order.",
      })
      router.push(`/orders/${orderId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Fulfillment type */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Fulfillment</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["delivery", "pickup"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => form.setValue("fulfillmentType", type)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm font-medium transition-all",
                  fulfillmentType === type
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {type === "delivery" ? (
                  <MapPin className="h-5 w-5" />
                ) : (
                  <Store className="h-5 w-5" />
                )}
                {type === "delivery" ? "Delivery" : "In-Store Pickup"}
              </button>
            ))}
          </div>
        </div>

        {/* Delivery address fields */}
        {fulfillmentType === "delivery" && (
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Delivery Address
            </p>
            <Input placeholder="Street address" {...form.register("newAddress.line1")} />
            <Input placeholder="Apt, suite, unit (optional)" {...form.register("newAddress.line2")} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="City" {...form.register("newAddress.city")} />
              <Input placeholder="State" {...form.register("newAddress.state")} />
            </div>
            <Input placeholder="ZIP code" {...form.register("newAddress.zip")} />
          </div>
        )}

        {fulfillmentType === "pickup" && (
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            📍 Pickup available at our Charlotte, NC store. We&apos;ll email you
            when your order is ready.
          </div>
        )}

        {/* Notes */}
        <FormField
          control={form.control}
          name="customerNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">
                Order Notes <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special instructions…"
                  className="resize-none h-20 text-sm"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {loading ? "Placing Order…" : "Place Order"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          No payment required now — we&apos;ll contact you to arrange payment.
        </p>
      </form>
    </Form>
  )
}
