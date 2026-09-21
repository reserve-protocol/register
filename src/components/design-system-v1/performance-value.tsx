import type { HTMLAttributes } from 'react'

import { v1Typography } from './typography'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'
import { cn } from '@/lib/utils'

export interface PerformanceValueProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  periodLabel: string
  value: number | null
}

const formatPerformance = (value: number) => {
  if (value > 0) return `+${value.toFixed(2)}%`
  if (value < 0) return `−${Math.abs(value).toFixed(2)}%`
  return '0.00%'
}

export const PerformanceValue = ({
  className,
  periodLabel,
  value,
  ...props
}: PerformanceValueProps) => {
  const direction =
    value === null
      ? null
      : value > 0
        ? 'positive'
        : value < 0
          ? 'negative'
          : 'neutral'
  const visibleValue = value === null ? '—' : formatPerformance(value)
  const accessibleValue =
    value === null
      ? 'no data'
      : `${direction} ${Math.abs(value).toFixed(2)} percent`

  return (
    <span
      aria-label={`${periodLabel} performance: ${accessibleValue}`}
      className={cn(
        v1Typography.label,
        'whitespace-nowrap text-right tabular-nums',
        direction === 'positive' && PERFORMANCE_TEXT_CLASSES.positive,
        direction === 'negative' && PERFORMANCE_TEXT_CLASSES.negative,
        direction === null && 'text-supporting-foreground',
        className
      )}
      data-slot="performance-value"
      title={`${periodLabel} performance`}
      {...props}
    >
      {visibleValue}
    </span>
  )
}
