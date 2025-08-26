import { Skeleton } from '@/components/ui/skeleton'

const GovernanceProposalPreviewSkeleton = () => (
  <div className="m-6 pb-6">
    <div className="flex items-center gap-2">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-7 w-20 ml-auto" />
    </div>
    <Skeleton className="h-10 mt-4" />
    <Skeleton className="h-10 mt-2" />
    <Skeleton className="h-10 mt-2" />
    <Skeleton className="h-10 mt-2" />
    <Skeleton className="h-10 mt-2 " />
  </div>
)

export default GovernanceProposalPreviewSkeleton
