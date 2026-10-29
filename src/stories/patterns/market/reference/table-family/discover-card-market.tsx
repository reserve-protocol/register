import { Skeleton } from '@/components/design-system-v1/loading'
import { PerformanceValue } from '@/components/design-system-v1/performance-value'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { DiscoverMoney } from './discover-cells'
import { finiteValue, type DiscoverRow } from './discover-fixtures'

export function DiscoverCardMarket({
  row,
  loading,
}: {
  row: DiscoverRow
  loading: boolean
}) {
  return (
    <div
      data-slot="discover-card-market"
      className={cn(
        type.body,
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-2'
      )}
    >
      <div
        className={cn(
          'relative flex min-w-0 flex-wrap items-baseline gap-x-1.5',
          loading && '[&>*]:invisible'
        )}
      >
        <DiscoverMoney
          value={row.price}
          precision={row.price !== null && row.price >= 1 ? 2 : undefined}
        />
        <span className="break-all text-supporting-foreground">
          · ${row.symbol}
        </span>
        {loading && <Skeleton className="absolute inset-0 !visible" />}
      </div>
      <div
        className={cn(
          'relative inline-flex items-baseline gap-1',
          loading && '[&>*]:invisible'
        )}
      >
        <PerformanceValue
          value={finiteValue(row.change)}
          periodLabel="1M"
          className={type.body}
        />
        <span className={cn(type.supporting, 'text-supporting-foreground')}>
          (1M)
        </span>
        {loading && <Skeleton className="absolute inset-0 !visible" />}
      </div>
    </div>
  )
}
