import { cn } from '@/lib/utils'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'
import { Trans } from '@lingui/react/macro'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { IndexDTFPerformance } from '../../hooks/use-dtf-price-history'
import { DataType } from './price-chart-constants'

const colorClass = (change: number) => {
  if (change < 0) return PERFORMANCE_TEXT_CLASSES.negative
  if (change > 0) return PERFORMANCE_TEXT_CLASSES.positive
  return ''
}

const PercentageChange = ({
  performance,
  dataType,
  wrap = false,
  range = '7d',
  className,
}: {
  performance: IndexDTFPerformance['timeseries']
  dataType: DataType
  wrap?: boolean
  range?: string
  className?: string
}) => {
  if (performance.length < 2) {
    return (
      <span className="text-legend">
        <Trans>No data</Trans>
      </span>
    )
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
    <div
      className={cn('flex items-center gap-1', colorClass(change), className)}
    >
      {wrap && '('}
      {change > 0 ? (
        <ArrowUp className="h-5 w-5" />
      ) : (
        <ArrowDown className="h-5 w-5" />
      )}
      {change.toFixed(2)}%{wrap && ')'}
      <span className="ml-1">
        ({range === 'all' ? <Trans>All</Trans> : range})
      </span>
    </div>
  )
}

export default PercentageChange
