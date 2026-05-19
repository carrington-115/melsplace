"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag } from "lucide-react";

export function HeroSection() {
  const scrollToProblem = () => {
    document.getElementById("problem")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/40 dark:via-stone-950 dark:to-amber-950/20" />

      {/* Decorative circles */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-orange-300/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-amber-300/15 blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="max-w-3xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-300/60 bg-amber-100/80 dark:bg-amber-900/30 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Authentic African Food — Delivered Across the US
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-6">
            Taste of Africa,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
              Delivered
            </span>{" "}
            to Your Door
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl">
            Mel&apos;s Place brings the finest African pantry staples, spices,
            and specialty foods straight to your kitchen — no compromise on
            authenticity.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base font-semibold rounded-full shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
            >
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Now
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base rounded-full border-2"
              onClick={scrollToProblem}
            >
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-14 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["🇳🇬", "🇬🇭", "🇪🇹", "🇰🇪"].map((flag, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-sm"
                  >
                    {flag}
                  </div>
                ))}
              </div>
              <span>Products from 10+ African countries</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-500">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} className="text-sm">
                    {s}
                  </span>
                ))}
              </div>
              <span>Trusted by 500+ families</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 80L60 69.3C120 59 240 37 360 32C480 27 600 37 720 42.7C840 48 960 48 1080 42.7C1200 37 1320 27 1380 21.3L1440 16V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
