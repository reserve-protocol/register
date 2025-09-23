import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'
import { factsheetTimeRangeAtom } from '../atoms'

const ALL_TIME_RANGES = [
  { label: '24H', value: '24h', minAge: 0 },
  { label: '7D', value: '7d', minAge: 604_800 },
  { label: '1M', value: '1m', minAge: 2_592_000 },
  { label: '3M', value: '3m', minAge: 7_776_000 },
  { label: 'YTD', value: '1y', minAge: 0 }, // YTD instead of 1Y
  { label: '1Y', value: '1y', minAge: 31_536_000 },
  { label: 'Max', value: 'all', minAge: 0 },
] as const

const FactsheetTimeRangeSelector = () => {
  const [range, setRange] = useAtom(factsheetTimeRangeAtom)
  const dtf = useAtomValue(indexDTFAtom)

  const availableRanges = useMemo(() => {
    if (!dtf?.timestamp) return null

    const now = Math.floor(Date.now() / 1_000)
    const dtfAge = now - dtf.timestamp

    return ALL_TIME_RANGES.filter(tr => {
      if (tr.value === 'all' || tr.label === 'YTD') return true
      if (tr.value === '24h') return dtfAge >= 86_400
      return dtfAge >= tr.minAge
    })
  }, [dtf?.timestamp])

  // Auto-update range when current selection is not available
  useEffect(() => {
    if (availableRanges && !availableRanges.find(r => r.value === range)) {
      // Default to 'all' if current range is not available
      setRange('all')
    }
  }, [availableRanges, range, setRange])

  if (!availableRanges) {
    return (
      <div className="gap-1 bg-white/10 rounded-full p-1 inline-flex">
        <Skeleton className="h-6 w-[200px] rounded-full" />
      </div>
    )
  }

  return (
    <div className="gap-1 bg-white/10 rounded-full p-1 inline-flex">
      {availableRanges.map((tr) => (
        <Button
          key={tr.label}
          variant="ghost"
          className={`h-6 px-2 mr-1 text-xs text-white/80 rounded-full hover:bg-white hover:text-black ${
            (tr.value === range || (tr.label === 'Max' && range === 'all'))
              ? 'bg-white text-black'
              : ''
          }`}
          onClick={() => setRange(tr.value as any)}
        >
          {tr.label}
        </Button>
      ))}
    </div>
  )
}

export default FactsheetTimeRangeSelector