import { Skeleton } from '@/components/ui/skeleton'

export const LoadingState = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 md:px-0">
      {/* Active Rebalances Section */}
      <section>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Active Rebalances</h2>
          <span className="text-2xl font-semibold text-muted-foreground">1</span>
        </div>
        
        {/* Active Rebalance Item Skeleton */}
        <div className="bg-card rounded-2xl p-4 md:p-6 shadow-sm border">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-3 md:gap-4 flex-1">
              {/* Circle badge */}
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Title */}
                <Skeleton className="h-6 md:h-7 w-full max-w-xs md:max-w-md mb-2" />
                
                {/* Proposed info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                  <Skeleton className="h-4 md:h-5 w-40 md:w-48" />
                  <Skeleton className="h-4 md:h-5 w-32 md:w-44" />
                </div>
                
                {/* Time badges - Only show expires in timer for skeleton */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <Skeleton className="h-7 md:h-8 w-28 md:w-36 rounded-full" />
                </div>
              </div>
            </div>
            
            {/* Button skeleton */}
            <Skeleton className="h-9 md:h-10 w-full md:w-36 rounded-md mt-4 md:mt-0" />
          </div>
        </div>
      </section>

      {/* Historical Rebalances Section */}
      <section>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Historical Rebalances</h2>
          <span className="text-2xl font-semibold text-muted-foreground">1</span>
        </div>
        
        {/* Historical Rebalance Item Skeleton */}
        <div className="bg-card rounded-2xl p-4 md:p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              {/* Checkmark circle */}
              <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              
              {/* Title */}
              <Skeleton className="h-6 md:h-7 w-full max-w-xs md:max-w-md" />
            </div>
            
            {/* Completed badge */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <span className="text-sm text-muted-foreground">Completed</span>
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          </div>
          
          {/* Metrics Row Skeleton - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* Auctions run */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Auctions run</p>
                <Skeleton className="h-4 md:h-5 w-20 md:w-24 mt-0.5" />
              </div>
            </div>
            
            {/* Total price impact */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Total price impact</p>
                <Skeleton className="h-4 md:h-5 w-24 md:w-32 mt-0.5" />
              </div>
            </div>
            
            {/* Rebalance accuracy */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Rebalance accuracy</p>
                <Skeleton className="h-4 md:h-5 w-16 md:w-20 mt-0.5" />
              </div>
            </div>
            
            {/* Deviation from target */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Deviation from target</p>
                <Skeleton className="h-4 md:h-5 w-16 md:w-20 mt-0.5" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}