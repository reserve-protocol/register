import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { PERFORMANCE_CHART_FADE_CLASSNAME } from './constants'

export const PerformanceChartSkeleton = ({
  className,
  fadeClassName = PERFORMANCE_CHART_FADE_CLASSNAME,
}: {
  className: string
  fadeClassName?: string
}) => (
  <div className="relative">
    <div className={cn('pointer-events-none w-full', className)}>
      <Skeleton className="h-full w-full rounded-none bg-primary/10" />
    </div>
    {fadeClassName && <div className={cn(fadeClassName)} />}
  </div>
)
