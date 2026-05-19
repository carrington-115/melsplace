"use client"

import { useState } from "react"
import { MapPin, Plus, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { addressSchema, type AddressFormValues } from "@/lib/validations/user"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import type { Address } from "@/types"

interface AddressesSectionProps {
  addresses: Address[]
  userId: string
}

export function AddressesSection({
  addresses: initialAddresses,
}: AddressesSectionProps) {
  const [addresses, setAddresses] = useState(initialAddresses)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema) as Resolver<AddressFormValues>,
    defaultValues: {
      label: "Home",
      line1: "",
      city: "",
      state: "",
      zip: "",
      isDefault: false,
    },
  })

  async function onSubmit(values: AddressFormValues) {
    setLoading(true)
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("Failed to add address")
      const { address } = await res.json()
      setAddresses((prev) => [...prev, address])
      toast.success("Address added")
      setOpen(false)
      form.reset()
    } catch {
      toast.error("Failed to save address")
    } finally {
      setLoading(false)
    }
  }

  async function deleteAddress(id: string) {
    try {
      await fetch(`/api/addresses/${id}`, { method: "DELETE" })
      setAddresses((prev) => prev.filter((a) => a.id !== id))
      toast.success("Address removed")
    } catch {
      toast.error("Failed to remove address")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Saved Addresses</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Home, Work, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Input
                  placeholder="Apt, suite (optional)"
                  {...form.register("line2")}
                />
                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Charlotte" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="NC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP</FormLabel>
                        <FormControl>
                          <Input placeholder="28201" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving…" : "Save Address"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <MapPin className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="rounded-xl border p-4 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium">{addr.label}</span>
                    {addr.isDefault && (
                      <Badge variant="secondary" className="text-xs h-4">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {addr.city}, {addr.state} {addr.zip}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => deleteAddress(addr.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
