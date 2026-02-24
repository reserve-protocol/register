import { Skeleton } from '@/components/ui/skeleton'

const SectionSkeleton = () => (
  <div>
    <div className="mb-4 px-4">
      <div className="flex items-center gap-2">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-4 w-64 mt-1" />
    </div>
    <Skeleton className="h-[340px] rounded-[20px]" />
  </div>
)

const PortfolioSkeleton = ({
  isImpersonating,
}: {
  isImpersonating?: boolean
}) => (
  <div className="container mx-auto px-4 py-6 space-y-8 animate-in fade-in">
    {isImpersonating && <Skeleton className="h-[52px] rounded-2xl" />}

    {/* Top section: Chart + Sidebar */}
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div>
        <Skeleton className="h-[50px] w-56" />
        <Skeleton className="h-5 w-40 mt-2" />
        <Skeleton className="h-[377px] rounded-2xl mt-4" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-[258px] rounded-[20px]" />
        <Skeleton className="h-[196px] rounded-[20px]" />
      </div>
    </div>

    {/* Section placeholders */}
    <SectionSkeleton />
    <SectionSkeleton />
    <SectionSkeleton />
  </div>
)

export default PortfolioSkeleton
