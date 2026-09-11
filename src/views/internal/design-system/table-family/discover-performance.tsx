import { Line, LineChart, YAxis } from 'recharts'
import { PerformanceValue } from '@/components/design-system-v1/performance-value'
import { Skeleton } from '@/components/design-system-v1/loading'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'
import { cn } from '@/lib/utils'
import {
  finiteValue,
  validTrend,
  trendDomain,
  type DiscoverRow,
} from './discover-fixtures'

export function DiscoverPerformance({
  row,
  loading = false,
}: {
  row: DiscoverRow
  loading?: boolean
}) {
  const change = finiteValue(row.change)
  const hasTrend = validTrend(row.series)
  if (loading) return <Skeleton className="h-6 w-40" />
  return (
    <div
      className="flex items-center justify-end gap-3"
      data-slot="discover-performance"
    >
      <PerformanceValue
        periodLabel="30D"
        value={change}
        className={type.body}
      />
      <div
        data-slot="discover-trend"
        aria-hidden="true"
        className={cn(
          'h-10 w-[90px] shrink-0',
          change !== null && change > 0 && PERFORMANCE_TEXT_CLASSES.positive,
          change !== null && change < 0 && PERFORMANCE_TEXT_CLASSES.negative,
          change === null && 'text-supporting-foreground'
        )}
      >
        {hasTrend && (
          <LineChart
            width={90}
            height={40}
            data={row.series}
            margin={{ top: 3, right: 2, bottom: 3, left: 2 }}
            accessibilityLayer={false}
          >
            <YAxis hide domain={trendDomain} />
            <Line
              type="linear"
              dataKey="value"
              stroke="currentColor"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        )}
      </div>
    </div>
  )
}
