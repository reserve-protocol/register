import { Skeleton } from '@/components/design-system-v1/loading'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'
import { type BrowseRecord, type RecordMetric } from './model'
import { RecordPlaceholder } from './record-placeholder'

export function RecordOperationalContext({
  record,
  loading,
}: {
  record: BrowseRecord
  loading: boolean
}) {
  const ending = record.metrics.find((metric) => metric.kind === 'auction-end')
  const access =
    record.access === 'restricted'
      ? 'Only the auction launcher can start auctions'
      : record.access === 'launcher'
        ? 'Connected launcher wallet'
        : 'Permissionless'
  return (
    <div
      data-testid="rebalance-operational-context"
      className={cn(
        type.supporting,
        'relative min-w-0 text-supporting-foreground',
        loading && 'invisible'
      )}
    >
      <span
        data-testid="rebalance-auction-number"
        className="whitespace-nowrap font-medium text-foreground"
      >
        Auction {record.auctionNumber}
      </span>
      <span aria-hidden="true" className="mx-1">
        ·
      </span>{' '}
      {ending ? (
        <dl data-testid="rebalance-primary-timing" className="inline">
          <RecordMetricPair metric={ending} loading={false} />
        </dl>
      ) : (
        <span data-testid="rebalance-access">{access}</span>
      )}
      {loading && (
        <Skeleton className="visible absolute left-0 top-0 h-5 w-60 max-w-full" />
      )}
    </div>
  )
}

export function RecordMetrics({
  record,
  loading,
}: {
  record: BrowseRecord
  loading: boolean
}) {
  const metrics = record.metrics.filter(
    (metric) => metric.kind !== 'auction-end'
  )
  if (!metrics.length) return null
  return (
    <dl
      data-testid={
        record.active
          ? 'rebalance-operational-summary'
          : 'rebalance-outcome-summary'
      }
      className="flex flex-wrap items-baseline gap-x-6 gap-y-2"
      aria-hidden={loading || undefined}
    >
      {metrics.map((metric, index) => (
        <RecordMetricPair
          key={metric.label}
          metric={metric}
          loading={loading || record.metricsLoading}
          labelLoading={loading || (record.metricsLoading && index === 2)}
        />
      ))}
    </dl>
  )
}

function RecordMetricPair({
  metric,
  loading,
  labelLoading = loading,
}: {
  metric: RecordMetric
  loading: boolean
  labelLoading?: boolean
}) {
  return (
    <div
      data-testid={
        metric.kind === 'auctions-run'
          ? 'rebalance-auction-history'
          : 'rebalance-fact'
      }
      className="inline-flex min-w-0 max-w-full items-baseline gap-1 align-baseline"
    >
      <dt className={cn(type.supporting, 'min-w-0 text-supporting-foreground')}>
        {labelLoading ? (
          <RecordPlaceholder>{metric.label}</RecordPlaceholder>
        ) : (
          metric.label
        )}
      </dt>
      <dd className={cn(type.label, 'shrink-0')}>
        <RecordMetricValue metric={metric} loading={loading} />
      </dd>
    </div>
  )
}

function RecordMetricValue({
  metric,
  loading,
}: {
  metric: RecordMetric
  loading: boolean
}) {
  if (loading)
    return (
      <RecordPlaceholder className="w-20">
        {metric.value ?? '—'}
      </RecordPlaceholder>
    )
  return (
    <span
      data-testid="rebalance-metric-value"
      data-unavailable={metric.value === null}
      className={cn(
        type.label,
        'whitespace-nowrap tabular-nums text-foreground',
        metric.tone && PERFORMANCE_TEXT_CLASSES[metric.tone],
        metric.value === null && 'text-supporting-foreground'
      )}
    >
      {metric.value ?? '—'}
    </span>
  )
}
