import { indexDTFAtom, performanceTimeRangeAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { dataTypeAtom, priceHistoryAvailabilityAtom } from './price-chart-atoms'
import { historicalConfigs, type Range } from './price-chart-constants'

export const ALL_TIME_RANGES = [
  { label: '24H', value: '24h' },
  { label: '7D', value: '7d' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: 'YTD', value: 'ytd' },
  { label: '1Y', value: '1y' },
  { label: 'All', value: 'all' },
] as const

export type TimeRangeOption = (typeof ALL_TIME_RANGES)[number]

const getRangeStartTolerance = (range: Exclude<Range, 'all'>) =>
  historicalConfigs[range].interval === '1h' ? 3_600 : 86_400

// Pure: which ranges are selectable given when the DTF launched / when price
// history actually starts. `firstHistoryTimestamp === undefined` means "not
// resolved yet" (keep everything), `null` means "no history" (only `all`).
export const getAvailableTimeRanges = ({
  dtfTimestamp,
  firstHistoryTimestamp,
  isYieldMode,
}: {
  dtfTimestamp: number | undefined
  firstHistoryTimestamp: number | null | undefined
  isYieldMode: boolean
}): TimeRangeOption[] | null => {
  if (!dtfTimestamp) return null

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
}

// Shared by the time-range buttons (footer/header) and the mobile dropdown so
// both stay in sync. Also owns the reset-to-`all` effect when the selected
// range becomes unavailable.
export const useAvailableTimeRanges = () => {
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

  const availableRanges = getAvailableTimeRanges({
    dtfTimestamp: dtf?.timestamp,
    firstHistoryTimestamp,
    isYieldMode,
  })

  useEffect(() => {
    if (availableRanges && !availableRanges.find((r) => r.value === range)) {
      setRange('all')
    }
  }, [availableRanges, range, setRange])

  return { range, setRange, availableRanges }
}
