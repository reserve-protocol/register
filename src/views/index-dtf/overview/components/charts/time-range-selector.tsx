import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom, performanceTimeRangeAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Trans } from '@lingui/react/macro'
import {
  dataTypeAtom,
  priceHistoryAvailabilityAtom,
} from './price-chart-atoms'
import { historicalConfigs, type Range } from './price-chart-constants'

const ALL_TIME_RANGES = [
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '1Y', value: '1y' },
  { label: 'All', value: 'all' },
] as const

const getRangeStartTolerance = (range: Exclude<Range, 'all'>) => {
  return historicalConfigs[range].interval === '1h' ? 3_600 : 86_400
}

const TimeRangeSelector = ({
  variant = 'default',
}: {
  variant?: 'default' | 'minimal'
}) => {
  const [range, setRange] = useAtom(performanceTimeRangeAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const dataType = useAtomValue(dataTypeAtom)
  const priceHistoryAvailability = useAtomValue(priceHistoryAvailabilityAtom)
  const isYieldMode = dataType === 'yield'
  const hasCurrentDtfAvailability =
    priceHistoryAvailability?.address === dtf?.id?.toLowerCase()
  const firstHistoryTimestamp =
    priceHistoryAvailability && hasCurrentDtfAvailability
      ? priceHistoryAvailability.firstTimestamp
      : undefined

  const availableRanges = useMemo(() => {
    if (!dtf?.timestamp) return null

    return ALL_TIME_RANGES.filter((tr) => {
      if (tr.value === 'all') return true
      if (tr.value === '24h' && isYieldMode) return false
      if (firstHistoryTimestamp === null) return false
      if (firstHistoryTimestamp !== undefined) {
        return (
          firstHistoryTimestamp <=
          historicalConfigs[tr.value].from + getRangeStartTolerance(tr.value)
        )
      }

      return true
    })
  }, [dtf?.timestamp, firstHistoryTimestamp, isYieldMode])

  useEffect(() => {
    if (availableRanges && !availableRanges.find((r) => r.value === range)) {
      setRange('all')
    }
  }, [availableRanges, range, setRange])

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
