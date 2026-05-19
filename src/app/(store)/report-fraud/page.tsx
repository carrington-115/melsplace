import { ShieldAlert } from "lucide-react"
import { ContactForm } from "@/components/shared/contact-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Report Fraud",
  description: "Report suspicious activity or fraud at Mel's Place.",
}

export default function ReportFraudPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
          <ShieldAlert className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Report Fraud or Suspicious Activity</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            If you&apos;ve experienced or witnessed fraudulent activity involving Mel&apos;s Place,
            please let us know immediately. All reports are reviewed within 24 hours.
          </p>
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <ContactForm
          type="fraud"
          defaultSubject="Fraud Report"
          extraFields={
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Order Number <span className="text-muted-foreground">(if applicable)</span>
              </Label>
              <Input
                name="orderNumber"
                placeholder="MP-2025-XXXXX"
              />
            </div>
          }
        />
      </div>
    </div>
  )
}
