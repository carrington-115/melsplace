import { Skeleton } from "@/components/ui/skeleton"

export default function AdminOrdersLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-10 w-64" />
      <div className="rounded-xl border overflow-hidden">
        <div className="border-b px-4 py-3 flex gap-4">
          {["Order #", "Customer", "Type", "Status", "Total", "Date"].map((h) => (
            <Skeleton key={h} className="h-4 w-20" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b last:border-0 px-4 py-3 flex items-center gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
