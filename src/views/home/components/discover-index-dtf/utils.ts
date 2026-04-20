import { IndexDTFItem } from '@/hooks/useIndexDTFList'

export const calculatePercentageChange = (
  performance: IndexDTFItem['performance']
): string | null => {
  if (performance.length === 0) return null
  const firstValue = performance[0].value
  const lastValue = performance[performance.length - 1].value
  const percentageChange = ((lastValue - firstValue) / firstValue) * 100
  return `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(2)}%`
}
