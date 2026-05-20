import { db, faqs } from "@/db"
import { eq, asc } from "drizzle-orm"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "Find answers to common questions about orders, delivery, products, returns, and more at Mel's Place.",
  openGraph: {
    title: "Frequently Asked Questions | Mel's Place",
    description:
      "Find answers to common questions about orders, delivery, products, returns, and more at Mel's Place.",
    type: "website",
    url: "/faqs",
  },
  twitter: {
    card: "summary",
    title: "Frequently Asked Questions | Mel's Place",
    description:
      "Find answers to common questions about orders, delivery, products, returns, and more at Mel's Place.",
  },
}

export default async function FaqsPage() {
  const allFaqs = await db.query.faqs.findMany({
    where: eq(faqs.isPublished, true),
    orderBy: [asc(faqs.category), asc(faqs.displayOrder)],
  })

  // Group by category
  const grouped: Record<string, typeof allFaqs> = {}
  for (const faq of allFaqs) {
    const cat = faq.category ?? "General"
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(faq)
  }

  // Fallback FAQs if database is empty
  const fallback: Record<string, Array<{ question: string; answer: string }>> = {
    Orders: [
      {
        question: "How do I place an order?",
        answer:
          "Browse our products, add items to your cart, then click 'Place Order'. Choose delivery or in-store pickup, and we'll contact you to confirm.",
      },
      {
        question: "Can I modify or cancel my order?",
        answer:
          "Contact us within 2 hours of placing your order to request changes. Once an order is being processed, changes may not be possible.",
      },
    ],
    Delivery: [
      {
        question: "Do you deliver outside Charlotte, NC?",
        answer:
          "Yes! We deliver across the US. Delivery times and costs vary by location. Local Charlotte deliveries are typically same-day or next-day.",
      },
      {
        question: "How much does delivery cost?",
        answer:
          "Delivery is $8.99 for orders under $75. Orders over $75 qualify for free shipping.",
      },
    ],
    Products: [
      {
        question: "Are your products authentic?",
        answer:
          "Absolutely. We source directly from African suppliers and carefully curate every product to ensure authenticity and quality.",
      },
      {
        question: "How should I store perishable items?",
        answer:
          "Storage instructions vary by product. Most dried goods should be stored in a cool, dry place. Frozen items should go directly in the freezer.",
      },
    ],
    "Pickup & Returns": [
      {
        question: "Where is your Charlotte store located?",
        answer:
          "We're located in Charlotte, NC. Select 'In-Store Pickup' at checkout and we'll include the exact address in your confirmation email.",
      },
      {
        question: "What is your return policy?",
        answer:
          "We accept returns on non-perishable items within 7 days of purchase if the product is unopened. Please contact us to initiate a return.",
      },
    ],
  }

  const displayFaqs =
    Object.keys(grouped).length > 0 ? grouped : fallback

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-3">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">
          Can&apos;t find what you&apos;re looking for?{" "}
          <a href="/contact" className="text-primary font-medium hover:underline">
            Contact us
          </a>
          .
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(displayFaqs).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-lg font-semibold mb-3 text-primary">
              {category}
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              {items.map((faq, i) => (
                <AccordionItem
                  key={`${category}-${i}`}
                  value={`${category}-${i}`}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="text-left font-medium text-sm hover:no-underline hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  )
}
