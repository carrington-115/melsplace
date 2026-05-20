import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the Terms & Conditions for using Mel's Place — covering orders, payments, delivery, returns, and more.",
  openGraph: {
    title: "Terms & Conditions | Mel's Place",
    description:
      "Read the Terms & Conditions for using Mel's Place — covering orders, payments, delivery, returns, and more.",
    type: "website",
    url: "/terms",
  },
}

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using Mel's Place website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.",
  },
  {
    title: "2. Products and Pricing",
    content:
      "All product prices are listed in USD and are subject to change without notice. We reserve the right to limit quantities, refuse orders, or cancel orders at our discretion. Product images are for illustrative purposes and may vary slightly from actual products.",
  },
  {
    title: "3. Orders and Payment",
    content:
      "Orders are confirmed upon placement and subject to product availability. Payment is collected at the time of order. We currently accept payment via bank transfer, cash on delivery, or in-store. We reserve the right to cancel any order and issue a full refund.",
  },
  {
    title: "4. Delivery and Pickup",
    content:
      "Delivery is available across the US. Estimated delivery times are provided as guidance only and may vary due to circumstances beyond our control. In-store pickup is available at our Charlotte, NC location. We are not responsible for delays caused by incorrect address information provided by the customer.",
  },
  {
    title: "5. Returns and Refunds",
    content:
      "Non-perishable items may be returned within 7 days of receipt if unopened and in original condition. Perishable food items cannot be returned unless they arrive damaged or spoiled. To initiate a return, contact us at hello@melsplace.com with your order number and reason for return.",
  },
  {
    title: "6. Product Quality",
    content:
      "We take every care to ensure our products meet high quality standards. If you receive a product that is damaged, spoiled, or not as described, please contact us within 48 hours of receipt. We will offer a replacement or full refund at our discretion.",
  },
  {
    title: "7. Intellectual Property",
    content:
      "All content on this website, including text, images, logos, and design, is the property of Mel's Place and is protected by copyright law. You may not reproduce, distribute, or use any content without our express written permission.",
  },
  {
    title: "8. Limitation of Liability",
    content:
      "Mel's Place shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our total liability shall not exceed the amount paid for the specific order in question.",
  },
  {
    title: "9. Changes to Terms",
    content:
      "We reserve the right to update these Terms and Conditions at any time. Changes will be effective immediately upon posting to our website. Continued use of our services after changes constitutes acceptance of the updated terms.",
  },
  {
    title: "10. Contact",
    content:
      "For any questions about these Terms, please contact us at hello@melsplace.com or through our Contact page.",
  },
]

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>

      <p className="text-muted-foreground mb-8 leading-relaxed">
        Welcome to Mel&apos;s Place. These Terms and Conditions govern your use of our
        website and purchase of our products. Please read them carefully.
      </p>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="font-semibold text-primary mb-2">{section.title}</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
