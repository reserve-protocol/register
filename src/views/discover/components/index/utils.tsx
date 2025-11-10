import { IndexDTFItem } from '@/hooks/use-index-dtf-list'

export const calculatePercentageChange = (
  performance: IndexDTFItem['performance']
) => {
  if (performance.length === 0) {
    return <span className="text-legend">No data</span>
  }
  const firstValue = performance[0].value
  const lastValue = performance[performance.length - 1].value
  const percentageChange = ((lastValue - firstValue) / firstValue) * 100
  return `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(2)}%`
}
