import { type ReactNode } from 'react'
import { MetricValue } from '@/components/metric'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { Skeleton } from '@/components/design-system-v1/loading'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'
import { RecordProvenance } from './record-provenance'
import type { HistoricalRebalance } from './history-model'

export function HistoryIdentity({
  row,
  loading,
  provenance = true,
}: {
  row: HistoricalRebalance
  loading: boolean
  provenance?: boolean
}) {
  return (
    <div className="min-w-0" data-history-id={row.identity.id}>
      <div className={cn(type.itemTitle, 'min-w-0 [overflow-wrap:anywhere]')}>
        {loading ? (
          <HistoryPlaceholder>{row.identity.title}</HistoryPlaceholder>
        ) : (
          <span data-testid="history-record-title">{row.identity.title}</span>
        )}
      </div>
      {provenance && (
        <RecordProvenance
          identity={row.identity}
          chainId={row.chainId}
          loading={loading}
          compactDate
          className="pointer-events-auto mt-1 block"
        />
      )}
    </div>
  )
}

export function HistoryStatus({
  row,
  loading,
}: {
  row: HistoricalRebalance
  loading: boolean
}) {
  const pill = (
    <LifecycleStatusPill role="closed">{row.status}</LifecycleStatusPill>
  )
  return loading ? <HistoryPlaceholder>{pill}</HistoryPlaceholder> : pill
}

export function HistoryNumber({
  row,
  field,
  loading,
}: {
  row: HistoricalRebalance
  field: 'accuracy' | 'priceImpact' | 'traded' | 'navChange'
  loading: boolean
}) {
  const value =
    field === 'priceImpact' || field === 'navChange'
      ? row[field].value
      : row[field]
  const tone =
    field === 'priceImpact' || field === 'navChange'
      ? row[field].tone
      : undefined
  return (
    <MetricValue
      className={cn(
        'block whitespace-nowrap',
        value === null && 'text-supporting-foreground',
        tone && PERFORMANCE_TEXT_CLASSES[tone]
      )}
    >
      {loading || row.metricsLoading ? (
        <HistoryPlaceholder>{value ?? '—'}</HistoryPlaceholder>
      ) : (
        <span
          data-testid={`history-${field}`}
          aria-label={value === null ? 'Unavailable' : undefined}
        >
          {value ?? '—'}
        </span>
      )}
    </MetricValue>
  )
}

export function HistoryPriceImpactUsd({
  row,
  loading,
}: {
  row: HistoricalRebalance
  loading: boolean
}) {
  return (
    <div
      className={cn(type.supporting, 'tabular-nums text-supporting-foreground')}
    >
      {loading || row.metricsLoading ? (
        <HistoryPlaceholder>{row.priceImpactUsd ?? '—'}</HistoryPlaceholder>
      ) : (
        <span
          data-testid="history-priceImpactUsd"
          aria-label={row.priceImpactUsd === null ? 'Unavailable' : undefined}
        >
          {row.priceImpactUsd ?? '—'}
        </span>
      )}
    </div>
  )
}

export function HistoryAuctions({
  row,
  loading,
}: {
  row: HistoricalRebalance
  loading: boolean
}) {
  const value =
    row.auctions === null
      ? 'Auctions run —'
      : `${row.auctions} ${row.auctions === 1 ? 'Auction' : 'Auctions'} run`
  return (
    <div
      className={cn(type.supporting, 'text-supporting-foreground')}
      data-testid="history-auctions"
    >
      {loading || row.metricsLoading ? (
        <HistoryPlaceholder>{value}</HistoryPlaceholder>
      ) : (
        value
      )}
    </div>
  )
}

export function HistoryPlaceholder({ children }: { children: ReactNode }) {
  return (
    <span aria-hidden className="relative inline-block max-w-full align-bottom">
      <span className="invisible">{children}</span>
      <Skeleton className="absolute inset-x-0 top-0 h-5 max-w-64" />
    </span>
  )
}

export function HistoryFact({
  label,
  children,
  end = false,
}: {
  label: ReactNode
  children: ReactNode
  end?: boolean
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', end && 'text-right')}>
      <div className={cn(type.supporting, 'flex-1 text-supporting-foreground')}>
        {label}
      </div>
      {children}
    </div>
  )
}
