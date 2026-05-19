import { Skeleton } from "@/components/ui/skeleton"

export default function AdminProductsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-64" />
      <div className="rounded-xl border overflow-hidden">
        <div className="border-b px-4 py-3 flex gap-4">
          {["Name", "Category", "Price", "Inventory", "Status"].map((h) => (
            <Skeleton key={h} className="h-4 w-20" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b last:border-0 px-4 py-3 flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
            <Skeleton className="h-4 w-40 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
