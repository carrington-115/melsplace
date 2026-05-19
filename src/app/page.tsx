import { db, products, productImages, promotions } from "@/db";
import { eq, desc, asc } from "drizzle-orm";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { StorePreviewSection } from "@/components/landing/StorePreviewSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default async function LandingPage() {
  let featuredProducts: Awaited<ReturnType<typeof fetchFeaturedProducts>> = [];
  try {
    featuredProducts = await fetchFeaturedProducts();
  } catch {
    // DB unavailable at build time — renders empty state gracefully
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <FaqSection />
        <StorePreviewSection products={featuredProducts} />
      </main>
      <LandingFooter />
    </div>
  );
}

async function fetchFeaturedProducts() {
  return db.query.products.findMany({
    where: eq(products.isActive, true),
    with: {
      category: true,
      images: {
        orderBy: [asc(productImages.position)],
        limit: 1,
      },
      promotions: {
        where: eq(promotions.isActive, true),
      },
    },
    orderBy: [desc(products.isFeatured), desc(products.createdAt)],
    limit: 4,
  });
}
