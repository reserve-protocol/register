import { Skeleton } from '@/components/ui/skeleton'
import Help from '@/components/ui/help'
import { TimeRange } from '@/types'

interface PerformanceCellProps {
  change: number | null
  isLoading: boolean
  isNewlyAdded: boolean
  timeRange: TimeRange
}

const PERIOD_LABELS = {
  '24h': '24 hour',
  '7d': '7 day',
  '1m': '30 day',
  '3m': '90 day',
  '1y': '1 year',
  all: 'all time',
} as const

export const PerformanceCell = ({
  change,
  isLoading,
  isNewlyAdded,
  timeRange,
}: PerformanceCellProps) => {
  // Show skeleton while loading
  if (isLoading) {
    return <Skeleton className="h-4 w-[60px] mx-auto" />
  }

  // Show dash if no data available
  if (change == null) {
    return <span>—</span>
  }

  const formattedChange = `${change > 0 ? '+' : ''}${(change * 100).toFixed(2)}%`
  const changeColor =
    change < 0
      ? 'text-legend'
      : change > 0
        ? 'text-green-500'
        : 'text-muted-foreground'

  return (
    <div className="flex items-center justify-center gap-1">
      <span className={`${changeColor} text-sm sm:text-base`}>
        {formattedChange}
      </span>
      {isNewlyAdded && (
        <Help
          content={`This asset was added to the basket during this ${PERIOD_LABELS[timeRange]} period`}
          size={14}
          className="text-muted-foreground"
        />
      )}
    </div>
  )
}
