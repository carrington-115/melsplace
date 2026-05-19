import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
}

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content:
      "We collect information you provide directly to us, including your name, email address, phone number, and delivery address when you create an account or place an order. We also collect information automatically, such as your IP address and browser type, through cookies and analytics tools.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "We use your information to process and fulfill orders, communicate with you about your orders, send promotional emails (only with your consent), improve our website and services, and comply with legal obligations. We do not sell your personal information to third parties.",
  },
  {
    title: "3. Sharing Your Information",
    content:
      "We may share your information with service providers who assist us in operating our website and delivering orders (e.g., shipping carriers, email services). These providers are obligated to keep your data confidential and may only use it to perform services on our behalf.",
  },
  {
    title: "4. Cookies",
    content:
      "We use cookies to improve your browsing experience, remember your preferences, and analyze website traffic. You can control cookie settings through your browser. Disabling cookies may affect some website functionality.",
  },
  {
    title: "5. Data Security",
    content:
      "We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but will notify you promptly if a breach occurs.",
  },
  {
    title: "6. Data Retention",
    content:
      "We retain your personal information as long as your account is active or as needed to provide services. You can request deletion of your account and associated data at any time by contacting us.",
  },
  {
    title: "7. Your Rights",
    content:
      "You have the right to access, correct, or delete your personal information. You may opt out of marketing emails at any time. To exercise these rights, contact us at hello@melsplace.com.",
  },
  {
    title: "8. Children's Privacy",
    content:
      "Our services are not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.",
  },
  {
    title: "9. Changes to This Policy",
    content:
      "We may update this Privacy Policy periodically. We will notify you of significant changes by email or by posting a notice on our website. Your continued use of our services after changes constitutes acceptance.",
  },
  {
    title: "10. Contact Us",
    content:
      "For privacy-related questions or concerns, please contact us at hello@melsplace.com.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      <p className="text-muted-foreground mb-8 leading-relaxed">
        At Mel&apos;s Place, your privacy matters to us. This policy explains how we
        collect, use, and protect your personal information.
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
