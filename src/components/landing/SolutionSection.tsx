import { CheckCircle2, ShieldCheck, Star } from "lucide-react"

const SOLUTIONS = [
  {
    icon: CheckCircle2,
    title: "Curated with care",
    description:
      "Every product is hand-selected by Mel — personally verified for authenticity, quality, and taste. If it's not good enough for Mel's own kitchen, it doesn't make the store.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable, every time",
    description:
      "Consistent stock, transparent sourcing, and a real person behind every order. No mystery sellers, no counterfeit products — just real African food delivered right.",
  },
  {
    icon: Star,
    title: "Delivered nationwide",
    description:
      "Order from anywhere in the US and get your favorites at your doorstep, quickly and safely. Free shipping on qualifying orders — because access shouldn't come at a premium.",
  },
]

export function SolutionSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-amber-50/60 to-background dark:from-amber-950/20 dark:to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            The Solution
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Mel&apos;s Place changes that
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Built specifically for the African diaspora — a store that
            understands what you&apos;re looking for.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SOLUTIONS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl bg-card border border-amber-200/60 dark:border-amber-800/30 p-8 hover:border-amber-400/60 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 relative overflow-hidden"
            >
              {/* Top amber accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-t-2xl" />

              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
