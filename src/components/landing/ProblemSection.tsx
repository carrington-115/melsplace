import { AlertCircle, Search, Truck } from "lucide-react"

const PROBLEMS = [
  {
    icon: Search,
    title: "Impossible to find",
    description:
      "Local grocery stores carry little to no authentic African ingredients. You either settle for bland substitutes or drive hours to a specialty store.",
  },
  {
    icon: AlertCircle,
    title: "Inconsistent quality",
    description:
      "When you do find products, the quality is hit or miss — stale spices, poor sourcing, or mislabeled items that don't match what you grew up eating.",
  },
  {
    icon: Truck,
    title: "Unreliable vendors",
    description:
      "Online options are scattered across unreliable sellers with slow shipping, no customer support, and zero accountability for what arrives at your door.",
  },
]

export function ProblemSection() {
  return (
    <section id="problem" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            The Problem
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Sound familiar?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Millions of Africans in the diaspora struggle to find the foods
            that remind them of home. Until now.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROBLEMS.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className="group relative rounded-2xl border bg-card p-8 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                <Icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{description}</p>

              {/* Subtle decorative number */}
              <div className="absolute top-6 right-6 text-6xl font-black text-muted/20 select-none">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
