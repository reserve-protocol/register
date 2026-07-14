import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Trans } from '@lingui/react/macro'
import { useAvailableTimeRanges } from './use-available-time-ranges'
import { type Range } from './price-chart-constants'
import { chartTabActiveClassName, chartTabClassName } from './chart-tab-styles'

const TimeRangeSelector = ({
  variant = 'default',
}: {
  variant?: 'default' | 'minimal'
}) => {
  const { range, setRange, availableRanges } = useAvailableTimeRanges()

  if (!availableRanges) {
    return (
      <div className="sm:ml-0 sm:mr-auto">
        <Skeleton className="h-5 w-[200px]" />
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className="flex w-full justify-between gap-4 px-2 sm:w-auto sm:justify-start sm:px-0">
        {availableRanges.map((tr) => (
          <button
            key={tr.value}
            className={cn(
              'text-sm font-normal text-muted-foreground hover:text-foreground',
              tr.value === range && 'text-foreground'
            )}
            onClick={() => setRange(tr.value as Range)}
          >
            {tr.value === 'all' ? <Trans>ALL</Trans> : tr.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex w-full min-w-0 justify-between gap-2 xl:ml-0 xl:mr-auto xl:w-auto xl:justify-start xl:gap-4">
      {availableRanges.map((tr) => (
        <Button
          key={tr.value}
          variant="ghost"
          data-testid={`overview-range-${tr.value}`}
          data-active={tr.value === range ? 'true' : 'false'}
          className={cn(
            chartTabClassName,
            'shrink-0',
            tr.value === range && chartTabActiveClassName,
            tr.value === '3m' && 'hidden sm:inline-flex'
          )}
          onClick={() => setRange(tr.value as Range)}
        >
          {tr.value === 'all' ? <Trans>ALL</Trans> : tr.label}
        </Button>
      ))}
    </div>
  )
}

export default TimeRangeSelector
