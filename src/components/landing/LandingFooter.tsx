import React from "react"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Mail, Phone, Globe, Share2, Link2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const SHOP_LINKS = [
  { label: "All Products", href: "/products" },
  { label: "My Orders", href: "/orders" },
  { label: "My Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
]

const SUPPORT_LINKS = [
  { label: "FAQs", href: "#faqs" },
  { label: "Contact Us", href: "/contact" },
  { label: "Report a Bug", href: "/report-bug" },
]

const LEGAL_LINKS = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
]

const SOCIAL = [
  { icon: Globe, label: "Website", href: "#" },
  { icon: Share2, label: "Social", href: "#" },
  { icon: Link2, label: "Links", href: "#" },
]

export function LandingFooter() {
  return (
    <footer className="bg-stone-900 dark:bg-stone-950 text-stone-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <Image
                src="/logo.png"
                alt="Mel's Place"
                width={40}
                height={40}
                className="rounded-full ring-2 ring-amber-500/30"
              />
              <span className="font-bold text-lg text-white">Mel&apos;s Place</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed mb-6">
              Bringing the finest African food products to your table. Authentic
              flavors, delivered across the US.
            </p>
            <div className="space-y-2.5 text-sm text-stone-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Charlotte, NC</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-500 shrink-0" />
                <a
                  href="mailto:hello@melsplace.com"
                  className="hover:text-amber-400 transition-colors"
                >
                  hello@melsplace.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-amber-500 shrink-0" />
                <a
                  href="tel:+17045550100"
                  className="hover:text-amber-400 transition-colors"
                >
                  (704) 555-0100
                </a>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-stone-800 hover:bg-amber-500/20 hover:text-amber-400 flex items-center justify-center transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-white mb-5">Shop</h3>
            <ul className="space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-5">Support</h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-5">Legal</h3>
            <ul className="space-y-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-10 bg-stone-700/60" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-stone-500">
          <p>© {new Date().getFullYear()} Mel&apos;s Place. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1">
              Made with{" "}
              <span className="text-amber-500">♥</span> in Charlotte, NC
            </p>
            <span className="text-stone-700">·</span>
            <Link
              href="/admin-login"
              className="text-stone-600 hover:text-stone-400 transition-colors text-xs"
            >
              Admin Sign In
            </Link>
            <span className="text-stone-700">·</span>
            <Link
              href="/dashboard"
              className="text-stone-600 hover:text-stone-400 transition-colors text-xs"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
