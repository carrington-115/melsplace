import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { ContactForm } from "@/components/shared/contact-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Mel's Place.",
}

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Contact Us</h1>
        <p className="text-muted-foreground">
          Questions, feedback, or just want to say hello? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-5">
          <div className="rounded-xl border p-5">
            <h2 className="font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Email</p>
                  <a
                    href="mailto:hello@melsplace.com"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    hello@melsplace.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Phone</p>
                  <a
                    href="tel:+17045550100"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    (704) 555-0100
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">Charlotte, NC</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">Hours</p>
                  <p className="text-muted-foreground">Mon–Sat: 9am – 7pm</p>
                  <p className="text-muted-foreground">Sun: 11am – 5pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 rounded-xl border p-6">
          <ContactForm type="general" />
        </div>
      </div>
    </div>
  )
}
