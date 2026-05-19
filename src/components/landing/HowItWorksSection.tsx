import { Search, CreditCard, PackageCheck } from "lucide-react"

const STEPS = [
  {
    number: "01",
    icon: Search,
    title: "Browse the store",
    description:
      "Explore our curated selection of African pantry staples, spices, sauces, and specialty items — organized by country and category.",
  },
  {
    number: "02",
    icon: CreditCard,
    title: "Place your order",
    description:
      "Add to cart, choose your delivery address, and check out securely in minutes. We accept all major cards and payment methods.",
  },
  {
    number: "03",
    icon: PackageCheck,
    title: "Receive & enjoy",
    description:
      "Your order is carefully packaged and shipped to your door. Track it every step of the way and reach out if you need anything.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Three simple steps
          </h2>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Getting authentic African food delivered has never been easier.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-14 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 dark:from-amber-700 dark:via-amber-500 dark:to-amber-700" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {STEPS.map(({ number, icon: Icon, title, description }) => (
              <div key={number} className="flex flex-col items-center text-center">
                {/* Icon circle */}
                <div className="relative mb-8">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-foreground text-background text-xs font-black flex items-center justify-center border-2 border-background">
                    {number.slice(1)}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-20 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-px">
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/60 px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-bold text-xl text-foreground mb-1">
                Ready to taste the difference?
              </p>
              <p className="text-muted-foreground text-sm">
                Join hundreds of families already enjoying authentic African food at home.
              </p>
            </div>
            <a
              href="/products"
              className="shrink-0 inline-flex items-center justify-center h-11 px-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
            >
              Shop the Store
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
