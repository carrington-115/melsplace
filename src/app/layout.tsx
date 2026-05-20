import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://melsplace.com"
  ),
  title: {
    default: "Mel's Place — African Food Store",
    template: "%s | Mel's Place",
  },
  description:
    "Authentic African food products delivered to your door in Charlotte, NC and across the US. Shop grains, spices, beverages, snacks, and more.",
  keywords: [
    "African food",
    "African grocery",
    "Charlotte NC",
    "Nigerian food",
    "Ghanaian food",
    "African spices",
  ],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Mel's Place — African Food Store",
    description:
      "Authentic African food products delivered to your door in Charlotte, NC and across the US.",
    siteName: "Mel's Place",
    locale: "en_US",
    type: "website",
    url: "/",
    images: [{ url: "/logo.png", width: 400, height: 400, alt: "Mel's Place logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mel's Place — African Food Store",
    description:
      "Authentic African food products delivered to your door in Charlotte, NC and across the US.",
    images: ["/logo.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              {children}
              <Toaster richColors position="top-right" />
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
