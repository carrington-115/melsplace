import React from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Mail, Phone } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const SHOP_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "My Orders", href: "/orders" },
  { label: "My Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
]

const SUPPORT_LINKS = [
  { label: "FAQs", href: "/faqs" },
  { label: "Contact Us", href: "/contact" },
  { label: "Report Fraud", href: "/report-fraud" },
  { label: "Report a Bug", href: "/report-bug" },
]

const LEGAL_LINKS = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
]

const ADMIN_LINKS = [
  { label: "Admin Sign In", href: "/admin-login" },
  { label: "Admin Dashboard", href: "/dashboard" },
]

export function Footer() {
  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="Mel's Place"
                width={36}
                height={36}
                className="rounded-full"
              />
              <span className="font-bold text-lg text-white">Mel&apos;s Place</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Bringing the finest African food products to your table.
              Authentic flavors, delivered across the US.
            </p>
            <div className="mt-4 space-y-2 text-sm text-stone-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Charlotte, NC</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a
                  href="mailto:hello@melsplace.com"
                  className="hover:text-primary transition-colors"
                >
                  hello@melsplace.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a
                  href="tel:+17045550100"
                  className="hover:text-primary transition-colors"
                >
                  (704) 555-0100
                </a>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-2">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-stone-700" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-500">
          <p>© {new Date().getFullYear()} Mel&apos;s Place. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1">
              Made with{" "}
              <span className="text-primary">♥</span> in Charlotte, NC
            </p>
            <span className="text-stone-700">·</span>
            {ADMIN_LINKS.map((link, i) => (
              <React.Fragment key={link.href}>
                {i > 0 && <span className="text-stone-700">·</span>}
                <Link
                  href={link.href}
                  className="text-stone-600 hover:text-stone-400 transition-colors text-xs"
                >
                  {link.label}
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
