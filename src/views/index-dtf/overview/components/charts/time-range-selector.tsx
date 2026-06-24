import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Trans } from '@lingui/react/macro'
import { useAvailableTimeRanges } from './use-available-time-ranges'
import { type Range } from './price-chart-constants'

const TimeRangeSelector = ({
  variant = 'default',
}: {
  variant?: 'default' | 'minimal'
}) => {
  const { range, setRange, availableRanges } = useAvailableTimeRanges()

  if (!availableRanges) {
    return (
      <div className="gap-1 sm:ml-0 sm:mr-auto bg-white/10 rounded-full p-1">
        <Skeleton className="h-6 w-[200px] rounded-full" />
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className="flex gap-2">
        {availableRanges.map((tr) => (
          <button
            key={tr.value}
            className={`text-xs sm:text-sm ${tr.value === range ? 'text-white font-bold' : 'text-white/50'}`}
            onClick={() => setRange(tr.value as Range)}
          >
            {tr.value === 'all' ? <Trans>All</Trans> : tr.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="gap-1 sm:ml-0 sm:mr-auto bg-white/10 rounded-full p-1 flex">
      {availableRanges.map((tr) => (
        <Button
          key={tr.value}
          variant="ghost"
          className={`h-6 px-2 mr-1 sm:px-2 text-xs sm:text-sm text-white/80 rounded-[60px] hover:bg-white hover:text-black ${tr.value === range ? 'bg-white text-black' : ''}`}
          onClick={() => setRange(tr.value as Range)}
        >
          {tr.value === 'all' ? <Trans>All</Trans> : tr.label}
        </Button>
      ))}
    </div>
  )
}

export default TimeRangeSelector
