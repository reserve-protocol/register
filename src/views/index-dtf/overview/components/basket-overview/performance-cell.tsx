import { Skeleton } from '@/components/ui/skeleton'
import Help from '@/components/ui/help'
import { cn } from '@/lib/utils'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'
import { TimeRange } from '@/types'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'

interface PerformanceCellProps {
  change: number | null
  isLoading: boolean
  isNewlyAdded: boolean
  timeRange: TimeRange
  align?: 'start' | 'end'
}

const PERIOD_LABELS = {
  '24h': msg`24 hour`,
  '7d': msg`7 day`,
  '1m': msg`30 day`,
  '3m': msg`90 day`,
  ytd: msg`year to date`,
  '1y': msg`1 year`,
  all: msg`all time`,
} as const

export const PerformanceCell = ({
  change,
  isLoading,
  isNewlyAdded,
  timeRange,
  align = 'end',
}: PerformanceCellProps) => {
  const { t } = useLingui()
  const justifyClass = align === 'start' ? 'justify-start' : 'justify-end'
  // Show skeleton while loading
  if (isLoading) {
    return (
      <Skeleton className={cn('h-4 w-[60px]', align === 'end' && 'ml-auto')} />
    )
  }

  // Show dash if no data available
  if (change == null) {
    return <span className="dark:text-foreground">—</span>
  }

  const formattedChange = `${change > 0 ? '+' : ''}${(change * 100).toFixed(2)}%`
  const changeColor =
    change < 0
      ? PERFORMANCE_TEXT_CLASSES.negative
      : change > 0
        ? PERFORMANCE_TEXT_CLASSES.positive
        : 'text-muted-foreground dark:text-foreground'

  return (
    <div className={cn('flex items-center gap-1', justifyClass)}>
      <span className={cn(changeColor, 'text-sm font-medium sm:text-base')}>
        {formattedChange}
      </span>
      {isNewlyAdded && (
        <Help
          content={t`This asset was added to the basket during this ${t(PERIOD_LABELS[timeRange])} period`}
          size={14}
          className="text-muted-foreground"
        />
      )}
    </div>
  )
}
