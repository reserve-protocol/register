import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom, performanceTimeRangeAtom } from '@/state/dtf/atoms'
import { TimeRange } from '@/types'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { Trans } from '@lingui/react/macro'
import useIndexDTFPriceHistory from '../../hooks/use-dtf-price-history'
import { dataTypeAtom } from './price-chart'

export type Range = TimeRange

const ALL_TIME_RANGES = [
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '1Y', value: '1y' },
  { label: 'All', value: 'all' },
] as const
const ONE_YEAR_SECONDS = 31_536_000

const TimeRangeSelector = ({
  variant = 'default',
}: {
  variant?: 'default' | 'minimal'
}) => {
  const [range, setRange] = useAtom(performanceTimeRangeAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const dataType = useAtomValue(dataTypeAtom)
  const isYieldMode = dataType === 'yield'
  const currentHour = Math.floor(Date.now() / 3_600_000) * 3_600
  const oneYearAgo = Math.floor(Date.now() / 1_000) - ONE_YEAR_SECONDS
  const { data: allHistory } = useIndexDTFPriceHistory({
    address: dtf?.id,
    from: 0,
    to: currentHour,
    interval: '1d',
  })

  const hasHistoryOlderThanOneYear = useMemo(() => {
    if (!allHistory) return undefined

    return allHistory.timeseries.some(
      ({ price, timestamp }) => Boolean(price) && timestamp < oneYearAgo
    )
  }, [allHistory, oneYearAgo])

  const availableRanges = useMemo(() => {
    if (!dtf?.timestamp) return null

    return ALL_TIME_RANGES.filter((tr) => {
      if (tr.value === '24h') return !isYieldMode
      if (tr.value === 'all') return hasHistoryOlderThanOneYear !== false
      return true
    })
  }, [dtf?.timestamp, hasHistoryOlderThanOneYear, isYieldMode])

  useEffect(() => {
    if (availableRanges && !availableRanges.find((r) => r.value === range)) {
      setRange(
        (availableRanges.find((r) => r.value === '1y')?.value ??
          availableRanges[availableRanges.length - 1].value) as Range
      )
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
