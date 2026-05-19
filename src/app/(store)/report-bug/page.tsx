import { Bug } from "lucide-react"
import { ContactForm } from "@/components/shared/contact-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Report a Bug",
  description: "Help us improve by reporting a technical issue.",
}

export default function ReportBugPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
          <Bug className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Report a Bug</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Something not working right? Help us improve by describing the issue.
            We review all bug reports and aim to fix critical issues within 48 hours.
          </p>
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <ContactForm
          type="bug"
          defaultSubject="Bug Report"
          extraFields={
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Page or Feature Affected
              </Label>
              <Input
                name="pageAffected"
                placeholder="e.g. /products, Cart, Checkout, Sign-in…"
              />
            </div>
          }
        />
      </div>
    </div>
  )
}
