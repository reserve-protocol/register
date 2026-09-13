import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/button'
import { Link } from '@/components/design-system-v1/link'
import { Skeleton } from '@/components/design-system-v1/loading'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { MetricValue } from '@/components/metric'
import { cn } from '@/lib/utils'
import { getExplorerLink, ExplorerDataType } from '@/utils/getExplorerLink'
import { IdentityCell } from './cells'
import type { OwnedPosition } from './owned-fixtures'

export type ModifyOwned = (row: OwnedPosition, trigger: HTMLElement) => void

export const OwnedIdentity = ({
  row,
  loading,
  mobile = false,
}: {
  row: OwnedPosition
  loading: boolean
  mobile?: boolean
}) => (
  <div
    title={row.name}
    className={
      mobile
        ? '[&_[data-slot=entity-identity-supporting]]:overflow-visible [&_[data-slot=entity-identity-supporting]]:whitespace-normal'
        : undefined
    }
  >
    <IdentityCell
      name={row.symbol}
      supporting={
        mobile && row.family === 'lock' ? (
          <span className="flex flex-wrap items-baseline gap-x-1 [&_a]:text-sm">
            <OwnedUnderlying row={row} loading={loading} />
          </span>
        ) : (
          row.name
        )
      }
      symbol={row.underlying.symbol}
      address={row.underlying.address}
      chain={row.chain}
      loading={loading}
    />
  </div>
)

export function OwnedModify({
  row,
  loading,
  onModify,
}: {
  row: OwnedPosition
  loading: boolean
  onModify: ModifyOwned
}) {
  const props = {
    size: 'compact' as const,
    tone: 'secondary' as const,
    disabled: loading,
    'data-table-focus': `modify-${row.id}`,
    'aria-label': `Modify ${row.symbol}`,
    className: 'shrink-0',
  }
  return row.href ? (
    <Button {...props} asChild>
      <a
        href={row.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Modify ${row.symbol} (opens in a new tab)`}
      >
        Modify
        <ArrowUpRight aria-hidden className="size-3.5" />
      </a>
    </Button>
  ) : (
    <Button {...props} onClick={(event) => onModify(row, event.currentTarget)}>
      Modify
    </Button>
  )
}

export function OwnedBalance({
  row,
  loading,
}: {
  row: OwnedPosition
  loading: boolean
}) {
  return (
    <div className="min-w-0 space-y-0.5" data-slot="owned-balance">
      {loading || row.pending ? (
        <Skeleton className="inline-block h-6 w-24 max-w-full" />
      ) : (
        <MetricValue
          className={cn(
            'block [overflow-wrap:anywhere]',
            !row.balance && 'text-supporting-foreground'
          )}
        >
          {row.balance?.text ?? '—'}
          {row.balance && row.balanceUnit && <> {row.balanceUnit}</>}
        </MetricValue>
      )}
      {row.exchangeRate &&
        (loading || row.pending ? (
          <Skeleton className="inline-block h-5 w-36 max-w-full" />
        ) : (
          <span
            className={cn(type.supporting, 'block text-supporting-foreground')}
          >
            {row.exchangeRate}
          </span>
        ))}
    </div>
  )
}

export function OwnedNumber({
  row,
  field,
  loading,
}: {
  row: OwnedPosition
  field: 'value' | 'apy'
  loading: boolean
}) {
  return loading || (field === 'value' && row.pending) ? (
    <Skeleton className="inline-block h-6 w-20 max-w-full" />
  ) : (
    <MetricValue
      className={cn(
        'block [overflow-wrap:anywhere]',
        field === 'apy' && 'whitespace-nowrap',
        !row[field] && 'text-supporting-foreground'
      )}
    >
      {row[field]?.text ?? '—'}
    </MetricValue>
  )
}

export const OwnedUnderlying = ({
  row,
  loading,
}: {
  row: OwnedPosition
  loading: boolean
}) =>
  loading ? (
    <Skeleton className="h-6 w-16" />
  ) : (
    <Link
      treatment="contextual"
      aria-label={`Underlying ${row.underlying.symbol}, opens in a new tab`}
      external
      externalAnnouncement="opens in a new tab"
      data-table-focus={`underlying-${row.id}`}
      href={getExplorerLink(
        row.underlying.address,
        row.chain,
        ExplorerDataType.TOKEN
      )}
    >
      {row.underlying.symbol}
    </Link>
  )

export const OwnedFact = ({
  label,
  children,
  end = false,
}: {
  label: string
  children: ReactNode
  end?: boolean
}) => (
  <div className={cn('min-w-0 space-y-1', end && 'text-right')}>
    <div className={cn(type.supporting, 'text-supporting-foreground')}>
      {label}
    </div>
    {children}
  </div>
)
