import { PromotionBanner } from "@/components/store/promotion-banner"
import { Header } from "@/components/store/header"
import { Footer } from "@/components/store/footer"
import { MobileCartBar } from "@/components/store/mobile-cart-bar"

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <PromotionBanner />
      <Header />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileCartBar />
    </div>
  )
}
