import { Skeleton } from '@/components/design-system-v1/loading'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  getChartReferenceTimestamp,
  isAIDTF,
} from '@/utils/chart-reference-date'
import { PerformanceChart } from '@/views/home/components/highlighted-dtfs/performance-chart'
import { getPerformanceDirection } from '@/views/home/components/highlighted-dtfs/utils'
import { validTrend, type DiscoverRow } from './discover-fixtures'

export type DiscoverCardLayout = 'compact' | 'full'

export function DiscoverCardChart({
  row,
  layout,
  loading,
}: {
  row: DiscoverRow
  layout: DiscoverCardLayout
  loading: boolean
}) {
  const compact = layout === 'compact'
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const size = compact ? 'h-12 w-28' : 'h-52 w-full'
  return (
    <div
      data-slot="discover-card-chart"
      className={cn('shrink-0', size)}
      aria-hidden="true"
    >
      {loading ? (
        <Skeleton className={cn('rounded-lg', size)} />
      ) : validTrend(row.series) ? (
        <PerformanceChart
          chartKey={`${row.chainId}-${row.address}`}
          className={compact ? 'h-12' : 'h-52'}
          animate={!reducedMotion}
          direction={getPerformanceDirection(row.series)}
          fadeClassName={
            compact
              ? ''
              : 'pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-card/0 to-card'
          }
          launchMarkerToken={{
            address: row.address,
            chainId: row.chainId,
            logoSrc: row.brand.icon,
            symbol: row.symbol,
          }}
          launchTimestamp={getChartReferenceTimestamp(
            row.address,
            row.chainId,
            undefined
          )}
          performance={row.series}
          showPattern={!compact}
          useLaunchLabel={isAIDTF(row.address, row.chainId)}
        />
      ) : null}
    </div>
  )
}
