import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS = [
  {
    question: "Where do you source your products?",
    answer:
      "We source directly from trusted suppliers and importers across West, East, and South Africa. Every product is reviewed by Mel for authenticity and quality before it hits the store.",
  },
  {
    question: "Do you ship nationwide?",
    answer:
      "Yes! We ship to all 50 US states. Standard shipping typically takes 3–5 business days. We also offer expedited shipping at checkout for time-sensitive orders.",
  },
  {
    question: "What is your return policy?",
    answer:
      "If your order arrives damaged or incorrect, we'll replace it or issue a full refund — no questions asked. Reach out within 7 days of delivery and we'll sort it out right away.",
  },
  {
    question: "Are your products halal or kosher?",
    answer:
      "Many of our products are halal-certified. Product pages include certification details where available. We're continuously expanding our halal range based on customer demand.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Absolutely. Once your order ships you'll receive a tracking link via email. You can also view order status at any time from your account dashboard.",
  },
  {
    question: "Do you offer bulk or wholesale pricing?",
    answer:
      "Yes — if you're purchasing for a restaurant, community event, or in large quantities, contact us at hello@melsplace.com and we'll work out a custom quote for you.",
  },
  {
    question: "How do I create an account?",
    answer:
      "Click the Login button in the top-right corner and sign up with your email. Your account lets you track orders, save a wishlist, and checkout faster.",
  },
]

export function FaqSection() {
  return (
    <section id="faqs" className="py-24 bg-gradient-to-b from-amber-50/40 to-background dark:from-amber-950/10 dark:to-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            FAQs
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Got questions?
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Mel&apos;s Place.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-xl border bg-card px-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="text-center text-sm text-muted-foreground mt-10">
          Still have questions?{" "}
          <a
            href="/contact"
            className="text-primary font-medium hover:underline"
          >
            Contact us
          </a>
        </p>
      </div>
    </section>
  )
}
