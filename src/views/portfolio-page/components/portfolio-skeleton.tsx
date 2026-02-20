import { Skeleton } from '@/components/ui/skeleton'

const PortfolioSkeleton = () => (
  <div className="container mx-auto px-4 py-6 space-y-8 animate-in fade-in">
    {/* Top section */}
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-[220px] rounded-2xl" />
        <Skeleton className="h-8 w-72" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-[220px] rounded-2xl" />
        <Skeleton className="h-[100px] rounded-2xl" />
      </div>
    </div>
    {/* Sections */}
    {[1, 2, 3].map((i) => (
      <div key={i} className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-[200px] rounded-2xl" />
      </div>
    ))}
  </div>
)

export default PortfolioSkeleton
