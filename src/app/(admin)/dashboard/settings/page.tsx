import { db, contactSubmissions, faqs } from "@/db"
import { eq, desc, asc } from "drizzle-orm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin Settings" }

export default async function AdminSettingsPage() {
  const submissions = await db.query.contactSubmissions.findMany({
    orderBy: desc(contactSubmissions.createdAt),
    limit: 50,
  })

  const allFaqs = await db.query.faqs.findMany({
    orderBy: [asc(faqs.category), asc(faqs.displayOrder)],
  })

  const STATUS_COLORS: Record<string, string> = {
    open: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300",
    reviewed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300",
    resolved: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300",
  }

  const TYPE_ICONS: Record<string, string> = {
    general: "💬",
    fraud: "🚨",
    bug: "🐛",
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="store">Store Info</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="inbox">
            Contact Inbox
            {submissions.filter((s) => s.status === "open").length > 0 && (
              <Badge className="ml-2 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
                {submissions.filter((s) => s.status === "open").length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Store Info */}
        <TabsContent value="store" className="mt-6">
          <div className="rounded-xl border p-6 space-y-4 max-w-lg">
            <h2 className="font-semibold">Store Information</h2>
            <div className="space-y-3 text-sm">
              {[
                ["Store Name", "Mel's Place"],
                ["Tagline", "Authentic African Food · Charlotte, NC"],
                ["Address", "Charlotte, NC"],
                ["Email", "hello@melsplace.com"],
                ["Phone", "(704) 555-0100"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-muted-foreground font-medium">{label}</span>
                  <span className="text-right">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              To update store details, edit the configuration file or contact your developer.
            </p>
          </div>
        </TabsContent>

        {/* Shipping */}
        <TabsContent value="shipping" className="mt-6">
          <div className="rounded-xl border p-6 space-y-4 max-w-lg">
            <h2 className="font-semibold">Shipping & Fulfillment</h2>
            <div className="space-y-3 text-sm">
              {[
                ["Flat Shipping Rate", "$8.99"],
                ["Free Shipping Threshold", "$75.00"],
                ["Tax Rate (NC)", "7.25%"],
                ["In-Store Pickup", "Enabled"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="text-muted-foreground font-medium">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              These values are currently hardcoded. A future update will allow you to edit them here.
            </p>
          </div>
        </TabsContent>

        {/* FAQs */}
        <TabsContent value="faqs" className="mt-6">
          <div className="rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">FAQs ({allFaqs.length})</h2>
            </div>
            <div className="divide-y">
              {allFaqs.map((faq) => (
                <div key={faq.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{faq.question}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {faq.answer}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {faq.category && (
                        <Badge variant="secondary" className="text-xs">{faq.category}</Badge>
                      )}
                      <Badge variant={faq.isPublished ? "default" : "outline"} className="text-xs">
                        {faq.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {allFaqs.length === 0 && (
                <p className="px-5 py-8 text-sm text-muted-foreground text-center">
                  No FAQs yet.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Contact Inbox */}
        <TabsContent value="inbox" className="mt-6">
          <div className="rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold">Contact Submissions</h2>
            </div>
            <div className="divide-y">
              {submissions.map((sub) => (
                <div key={sub.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{TYPE_ICONS[sub.type]}</span>
                        <p className="font-medium text-sm">{sub.subject}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sub.name} · {sub.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-xs ${STATUS_COLORS[sub.status]}`}
                      >
                        {sub.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {sub.message}
                  </p>
                </div>
              ))}
              {submissions.length === 0 && (
                <p className="px-5 py-8 text-sm text-muted-foreground text-center">
                  No submissions yet.
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
