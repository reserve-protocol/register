import { Skeleton } from '@/components/ui/skeleton'

export const MobileBasketSkeleton = ({ isExposure = false }) => (
  <div className="flex flex-col pl-5 sm:hidden">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="border-b border-border py-5 last:border-b-0">
        <div className="flex items-start justify-between gap-4 pr-5">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-5 w-36" />
          </div>
          <Skeleton className="h-5 w-14 shrink-0" />
        </div>
        <div
          className={
            isExposure
              ? 'mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,max-content)_minmax(0,max-content)] items-start gap-x-4 pr-5'
              : 'mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,max-content)] items-start gap-x-4 pr-5'
          }
        >
          <div className="min-w-0">
            <Skeleton className="h-3 w-12" />
            <div className="mt-1.5 flex items-center gap-1.5">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="min-w-0">
            <Skeleton className="ml-auto h-3 w-24" />
            <Skeleton className="ml-auto mt-1.5 h-4 w-14" />
          </div>
          {isExposure && (
            <div className="min-w-0">
              <Skeleton className="ml-auto h-3 w-16" />
              <Skeleton className="ml-auto mt-1.5 h-4 w-12" />
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
)
