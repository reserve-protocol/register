import { Skeleton } from '@/components/ui/skeleton'
import Help from '@/components/ui/help'
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
      <Skeleton
        className={`h-4 w-[60px] ${align === 'end' ? 'ml-auto' : ''}`}
      />
    )
  }

  // Show dash if no data available
  if (change == null) {
    return <span className="dark:text-foreground">—</span>
  }

  const formattedChange = `${change > 0 ? '+' : ''}${(change * 100).toFixed(2)}%`
  const changeColor =
    change < 0
      ? 'text-[#9F4A3D] dark:text-[#D66A4A]'
      : change > 0
        ? 'text-[#657D32] dark:text-[#A2BB6E]'
        : 'text-muted-foreground dark:text-foreground'

  return (
    <div className={`flex items-center ${justifyClass} gap-1`}>
      <span className={`${changeColor} text-sm font-medium sm:text-base`}>
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
