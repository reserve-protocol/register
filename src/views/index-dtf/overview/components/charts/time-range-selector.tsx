import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom, performanceTimeRangeAtom } from '@/state/dtf/atoms'
import { TimeRange } from '@/types'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { dataTypeAtom } from './price-chart'

export type Range = TimeRange

const ALL_TIME_RANGES = [
  { label: '24H', value: '24h', minAge: 0 },
  { label: '7D', value: '7d', minAge: 604_800 },
  { label: '1M', value: '1m', minAge: 2_592_000 },
  { label: '3M', value: '3m', minAge: 7_776_000 },
  { label: '1Y', value: '1y', minAge: 31_536_000 },
  { label: 'All', value: 'all', minAge: 0 },
] as const

const TimeRangeSelector = ({
  variant = 'default',
}: {
  variant?: 'default' | 'minimal'
}) => {
  const [range, setRange] = useAtom(performanceTimeRangeAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const dataType = useAtomValue(dataTypeAtom)
  const isYieldMode = dataType === 'yield'

  const availableRanges = useMemo(() => {
    if (!dtf?.timestamp) return null

    const now = Math.floor(Date.now() / 1_000)
    const dtfAge = now - dtf.timestamp

    return ALL_TIME_RANGES.filter((tr) => {
      if (tr.value === 'all') return true
      if (tr.value === '24h') return !isYieldMode && dtfAge >= 86_400
      return dtfAge >= tr.minAge
    })
  }, [dtf?.timestamp, isYieldMode])

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
            {tr.label}
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
          {tr.label}
        </Button>
      ))}
    </div>
  )
}

export default TimeRangeSelector
