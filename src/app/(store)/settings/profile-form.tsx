"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import { updateProfileSchema, type UpdateProfileValues } from "@/lib/validations/user"

interface ProfileFormProps {
  defaultValues: {
    name: string
    phone: string
    email: string
  }
  userId: string
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: defaultValues.name,
      phone: defaultValues.phone,
    },
  })

  async function onSubmit(values: UpdateProfileValues) {
    setLoading(true)
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("Failed to update profile")
      toast.success("Profile updated")
    } catch {
      toast.error("Failed to save changes")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Email — read only from Clerk */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Email Address</Label>
          <Input
            value={defaultValues.email}
            disabled
            className="bg-muted/50 text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">
            Email is managed through your sign-in method.
          </p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Phone Number{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+1 (704) 555-0100"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </form>
    </Form>
  )
}
