import { InlineAction } from '@/components/button'
import { MetricValue } from '@/components/metric'
import { Skeleton } from '@/components/design-system-v1/loading'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { IdentityCell } from './cells'
import type { FixtureValue } from './fixtures'
import type { EarnRow } from './earn-fixtures'

export function EarnIdentity({
  row,
  loading,
  onOpen,
}: {
  row: EarnRow
  loading: boolean
  onOpen: (row: EarnRow, trigger: HTMLElement) => void
}) {
  const content = (
    <IdentityCell
      name={row.symbol}
      symbol={row.symbol}
      chain={row.chain}
      address={row.address}
      src={row.name === 'Reserve Rights' ? '/svgs/rsr.svg' : undefined}
      supporting={row.vault}
      loading={loading}
    />
  )
  if (loading) return content
  return (
    <InlineAction
      treatment="contextual"
      className="block min-w-0 whitespace-normal text-left hover:no-underline"
      data-table-focus={`earn-${row.id}`}
      data-testid={`earn-open-${row.id}`}
      onClick={(event) => {
        event.stopPropagation()
        onOpen(row, event.currentTarget)
      }}
    >
      {content}
    </InlineAction>
  )
}

export function EarnPair({
  primary,
  supporting,
  loading = false,
  align = 'start',
  muteZero = false,
}: {
  primary: FixtureValue
  supporting: string | null
  loading?: boolean
  align?: 'start' | 'end'
  muteZero?: boolean
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col',
        align === 'end' && 'items-end text-right'
      )}
      data-slot="earn-pair"
    >
      {loading ? (
        <>
          <Skeleton className="h-6 w-20" />
          <div className="flex h-5 items-center">
            <Skeleton className="h-3 w-24" />
          </div>
        </>
      ) : (
        <>
          <MetricValue
            className={cn(
              'block',
              (!primary || (muteZero && primary.order === 0n)) &&
                'text-supporting-foreground'
            )}
          >
            {primary?.text ?? '—'}
          </MetricValue>
          <span
            className={cn(
              type.supporting,
              'block break-words text-supporting-foreground'
            )}
          >
            {supporting ?? '—'}
          </span>
        </>
      )}
    </div>
  )
}

export function EarnRate({
  row,
  loading = false,
}: {
  row: EarnRow
  loading?: boolean
}) {
  return (
    <div
      className="flex min-h-6 flex-wrap items-baseline justify-end gap-x-1"
      data-slot="earn-rate"
    >
      {loading ? (
        <Skeleton className="h-4 w-16 self-center" />
      ) : (
        <MetricValue
          className={!row.rate ? 'text-supporting-foreground' : undefined}
        >
          {row.rate?.text ?? '—'}
        </MetricValue>
      )}
      <span className={cn(type.supporting, 'text-supporting-foreground')}>
        {row.rateKind}
      </span>
    </div>
  )
}

export function EarnWalletSummary({
  row,
  loading,
}: {
  row: EarnRow
  loading: boolean
}) {
  return (
    <div
      data-slot="earn-wallet-position"
      aria-busy={loading || undefined}
      className={cn(
        type.supporting,
        'flex min-w-0 flex-wrap items-center gap-x-2 text-supporting-foreground'
      )}
    >
      <span
        data-slot="earn-wallet-label"
        className="shrink-0 whitespace-nowrap"
      >
        {row.family === 'index' ? 'Your lock' : 'Your stake'}
      </span>
      <div
        data-slot="earn-wallet-values"
        className="inline-flex min-h-5 max-w-full flex-wrap items-center gap-x-1 tabular-nums"
      >
        {loading ? (
          <div className="flex h-5 items-center">
            <Skeleton className="h-3 w-12" />
          </div>
        ) : (
          <span className={cn('break-words', row.holding && 'text-foreground')}>
            {row.holding?.text ?? '—'}
          </span>
        )}
        <div className="inline-flex min-w-0 max-w-full items-center gap-x-1">
          <span aria-hidden>·</span>
          {loading ? (
            <div className="flex h-5 items-center">
              <Skeleton className="h-3 w-24" />
            </div>
          ) : (
            <span className="min-w-0 break-words">
              {row.holdingAmount ?? '—'}
            </span>
          )}
        </div>
      </div>
      {loading && <span className="sr-only">Loading wallet position</span>}
    </div>
  )
}
