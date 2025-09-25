import { Skeleton } from '@/components/ui/skeleton'
import Help from '@/components/ui/help'

interface PerformanceCellProps {
  change: number | null
  isLoading: boolean
  isNewlyAdded: boolean
  timeRange: '1d' | '1w' | '1m'
}

const PERIOD_LABELS = {
  '1d': '24 hour',
  '1w': '7 day',
  '1m': '30 day',
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
  const changeColor = change < 0 ? 'text-legend' : change > 0 ? 'text-green-500' : ''

  return (
    <div className="flex items-center justify-center gap-1">
      <span className={changeColor}>
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