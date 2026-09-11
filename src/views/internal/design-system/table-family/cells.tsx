import { type ReactNode } from 'react'
import { EntityIdentity, ChainBadgedLogo } from '@/components/entity-identity'
import { MetricValue } from '@/components/metric'
import { PerformanceValue } from '@/components/design-system-v1/performance-value'
import { Skeleton } from '@/components/design-system-v1/loading'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'
import { cn } from '@/lib/utils'
import { type FixtureValue } from './fixtures'

export const NumericCell = ({
  value,
  performance = false,
  loading = false,
}: {
  value: FixtureValue
  performance?: boolean
  loading?: boolean
}) =>
  loading ? (
    <Skeleton className="ml-auto h-6 w-20" />
  ) : (
    <MetricValue
      align="end"
      className={cn(
        'ml-auto block whitespace-nowrap',
        value === null && 'text-supporting-foreground',
        performance &&
          value &&
          value.order > 0n &&
          PERFORMANCE_TEXT_CLASSES.positive,
        performance &&
          value &&
          value.order < 0n &&
          PERFORMANCE_TEXT_CLASSES.negative
      )}
    >
      {value?.text ?? '—'}
    </MetricValue>
  )

export const PerformanceCell = ({
  value,
  loading = false,
}: {
  value: number | null
  loading?: boolean
}) =>
  loading ? (
    <Skeleton className="ml-auto h-6 w-16" />
  ) : (
    <PerformanceValue
      className={cn(type.body, 'block')}
      periodLabel="7D"
      value={value}
    />
  )

export const IdentityCell = ({
  name,
  symbol,
  chain,
  address,
  src,
  supporting = `$${symbol}`,
  loading = false,
}: {
  name: ReactNode
  symbol: string
  chain: number
  address?: string
  src?: string
  supporting?: ReactNode
  loading?: boolean
}) =>
  loading ? (
    <div className="flex min-h-11 min-w-0 flex-1 basis-40 items-center gap-3">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-col" data-slot="identity-skeleton-text">
        <div className="flex h-6 items-center">
          <Skeleton className="h-4 w-28" />
        </div>
        {supporting && (
          <div className="flex h-5 items-center">
            <Skeleton className="h-3 w-12" />
          </div>
        )}
      </div>
    </div>
  ) : (
    <EntityIdentity
      className="flex"
      wrapName
      name={name}
      supporting={supporting}
      mark={
        <ChainBadgedLogo
          symbol={symbol}
          src={src}
          address={address}
          chain={chain}
          size="xl"
        />
      }
    />
  )

export const Fact = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className="flex min-w-max flex-1 flex-col items-start gap-1 even:items-end even:text-right">
    <span className={cn(type.supporting, 'text-supporting-foreground')}>
      {label}
    </span>
    <div>{children}</div>
  </div>
)
