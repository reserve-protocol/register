import { cn } from '@/lib/utils'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { IndexDTFPerformance } from '../../hooks/use-dtf-price-history'
import { DataType } from './price-chart-constants'

const colorClass = (change: number) => {
  if (change < 0) return 'text-red-500'
  if (change > 0) return 'text-success'
  return ''
}

const PercentageChange = ({
  performance,
  dataType,
  wrap = false,
  range = '7d',
}: {
  performance: IndexDTFPerformance['timeseries']
  dataType: DataType
  wrap?: boolean
  range?: string
}) => {
  if (performance.length < 2) {
    return <span className="text-legend">No data</span>
  }

  const firstValue = performance[0][
    dataType as keyof (typeof performance)[0]
  ] as number
  const penultimateValue = performance[performance.length - 2][
    dataType as keyof (typeof performance)[0]
  ] as number

  const change =
    firstValue === 0
      ? penultimateValue
      : ((penultimateValue - firstValue) / firstValue) * 100

  return (
    <div className={cn('flex items-center', colorClass(change))}>
      {wrap && '('}
      {change > 0 ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      )}
      {change.toFixed(2)}%{wrap && ')'}
      <span className="ml-1">({range === 'all' ? 'All' : range})</span>
    </div>
  )
}

export default PercentageChange
