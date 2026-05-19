"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useUser, SignInButton, UserButton } from "@clerk/nextjs"
import { Menu, X, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Products", href: "#store-preview" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQs", href: "#faqs" },
]

export function LandingHeader() {
  const { isLoaded, isSignedIn } = useUser()
  const { theme, setTheme } = useTheme()
  const [role, setRole] = useState<"admin" | "customer" | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    fetch("/api/auth/role")
      .then((r) => r.json())
      .then((d) => setRole(d.role ?? "customer"))
      .catch(() => setRole("customer"))
  }, [isLoaded, isSignedIn])

  const actionBtn =
    role === "admin"
      ? { label: "Dashboard", href: "/dashboard" }
      : { label: "Browse Products", href: "/products" }

  const handleNavClick = (href: string) => {
    setMobileOpen(false)
    if (!href.startsWith("#")) return
    const el = document.getElementById(href.slice(1))
    el?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/60 shadow-sm"
          : "bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/logo.png"
              alt="Mel's Place"
              width={38}
              height={38}
              className="rounded-full"
              priority
            />
            <span className="font-bold text-lg text-foreground hidden sm:block">
              Mel&apos;s Place
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Action CTA — shown when loaded */}
            {isLoaded && isSignedIn && (
              <Button asChild size="sm" className="hidden sm:flex">
                <Link href={actionBtn.href}>{actionBtn.label}</Link>
              </Button>
            )}

            {/* Auth */}
            {isLoaded ? (
              isSignedIn ? (
                <UserButton />
              ) : (
                <SignInButton mode="modal">
                  <Button size="sm" variant="outline" className="hidden sm:flex">
                    Login
                  </Button>
                </SignInButton>
              )
            ) : (
              <div className="h-8 w-20 rounded-md bg-muted animate-pulse hidden sm:block" />
            )}

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  {mobileOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <nav className="flex flex-col gap-1 mt-8">
                  {NAV_LINKS.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className="text-left px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                  <div className="border-t my-4" />
                  {isLoaded && isSignedIn ? (
                    <Button asChild className="mx-4">
                      <Link href={actionBtn.href}>{actionBtn.label}</Link>
                    </Button>
                  ) : (
                    isLoaded && (
                      <SignInButton mode="modal">
                        <Button className="mx-4">Login</Button>
                      </SignInButton>
                    )
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
