import { Skeleton } from '@/components/ui/skeleton'

const PortfolioSkeleton = () => (
  <div className="container mx-auto py-6 space-y-6 animate-in fade-in">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-[200px] rounded-3xl" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-[180px] rounded-3xl" />
        <Skeleton className="h-[100px] rounded-3xl" />
      </div>
    </div>
    <Skeleton className="h-[300px] rounded-3xl" />
    <Skeleton className="h-[200px] rounded-3xl" />
    <Skeleton className="h-[200px] rounded-3xl" />
  </div>
)

export default PortfolioSkeleton
