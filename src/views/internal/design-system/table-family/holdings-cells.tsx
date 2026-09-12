import { EntityIdentity, ChainBadgedLogo } from '@/components/entity-identity'
import TokenLogo from '@/components/token-logo'
import { InlineAction } from '@/components/button'
import { Link } from '@/components/design-system-v1/link'
import { MetricValue } from '@/components/metric'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import { Skeleton } from '@/components/design-system-v1/loading'
import {
  v1Typography as type,
  v1TypographyVariants,
} from '@/components/design-system-v1/typography'
import { getTokenName, formatMarketCap } from '@/utils'
import { cn } from '@/lib/utils'
import { ArrowUpRight } from 'lucide-react'
import { BRIDGES, type Holding, type HoldingsTab } from './holdings-fixtures'
import { IdentityCell, PerformanceCell } from './cells'

export type BridgeHandler = (row: Holding, trigger: HTMLButtonElement) => void

export function HoldingIdentity({
  row,
  tab,
  loading = false,
  onBridge,
}: {
  row: Holding
  tab: HoldingsTab
  loading?: boolean
  onBridge: BridgeHandler
}) {
  if (loading)
    return (
      <IdentityCell
        loading
        name={holdingName(row, tab)}
        symbol={row.symbol}
        chain={56}
      />
    )
  return (
    <EntityIdentity
      wrapName
      nameLeading="compact"
      className="flex"
      mark={<HoldingMark row={row} tab={tab} />}
      name={<HoldingName row={row} tab={tab} />}
      supporting={<HoldingMetadata row={row} tab={tab} onBridge={onBridge} />}
    />
  )
}

export function HoldingName({
  row,
  tab,
  loading = false,
}: {
  row: Holding
  tab: HoldingsTab
  loading?: boolean
}) {
  if (loading) return <Skeleton className="h-6 w-44 max-w-full" />
  const name = holdingName(row, tab)
  return tab === 'collateral' ? (
    <Link
      href={`https://bscscan.com/token/${row.address}`}
      external
      externalAnnouncement="opens in a new tab"
      treatment="contextual"
      data-table-focus={`asset-${row.address}`}
      className={cn(
        v1TypographyVariants.compactItemTitle,
        'group/holding-name flex min-h-6 max-w-full'
      )}
      externalIcon={
        <ArrowUpRight
          aria-hidden="true"
          data-slot="holding-external-icon"
          strokeWidth={1.5}
          className="size-3.5 shrink-0 [@media(hover:hover)_and_(pointer:fine)]:[@container(min-width:48rem)]:opacity-0 group-hover/holding-name:opacity-100 group-focus-visible/holding-name:opacity-100"
        />
      }
    >
      <span className="min-w-0 break-words">{name}</span>
    </Link>
  ) : (
    name
  )
}

export function HoldingMark({
  row,
  tab,
  size = 'xl',
  loading = false,
}: {
  row: Holding
  tab: HoldingsTab
  size?: 'md' | 'xl'
  loading?: boolean
}) {
  if (loading)
    return (
      <Skeleton
        className={cn(
          'shrink-0 rounded-full',
          size === 'xl' ? 'size-8' : 'size-5'
        )}
      />
    )
  const exchange = ['nasdaq', 'nyse'].includes(row.native.caip2)
  return tab === 'collateral' ? (
    <ChainBadgedLogo
      size={size}
      chain={56}
      address={row.address}
      symbol={row.symbol}
    />
  ) : (
    <span data-entity-logo-size={size} className="inline-flex shrink-0">
      <TokenLogo
        size={size}
        alt=""
        symbol={exchange ? row.symbol : row.native.symbol}
        src={exchange ? undefined : row.native.logo}
      />
    </span>
  )
}

export function HoldingMetadata({
  row,
  tab,
  onBridge,
  loading = false,
}: {
  row: Holding
  tab: HoldingsTab
  onBridge: BridgeHandler
  loading?: boolean
}) {
  if (loading) return <Skeleton className="h-5 w-24 max-w-full" />
  const collateral = tab === 'collateral'
  const exchange = ['nasdaq', 'nyse'].includes(row.native.caip2)
  const symbol = collateral
    ? `$${row.symbol}`
    : exchange
      ? `${row.native.caip2.toUpperCase()}: $${row.symbol.replace(/on$/, '')}`
      : `$${row.native.symbol}${(row.sources ?? 1) > 1 ? ` (${row.sources} sources)` : ''}`
  const bridge = row.bridgeId ? BRIDGES[row.bridgeId] : null
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-x-1.5">
      <span>{symbol}</span>
      {collateral && bridge && !bridge.wrappedVersion && (
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap">
          <span aria-hidden="true" data-slot="metadata-separator">
            ·
          </span>
          <InlineAction
            treatment="contextual"
            className={cn(
              type.supporting,
              'shrink-0 text-supporting-foreground underline decoration-supporting-foreground/50 hover:text-foreground hover:decoration-foreground focus-visible:text-foreground focus-visible:decoration-foreground'
            )}
            data-table-focus={`bridge-${row.address}`}
            onClick={(event) => onBridge(row, event.currentTarget)}
          >
            Bridged
          </InlineAction>
        </span>
      )}
    </span>
  )
}

export function Allocation({
  value,
  loading = false,
  emphasized = false,
}: {
  value: number
  loading?: boolean
  emphasized?: boolean
}) {
  return loading ? (
    <Skeleton className="ml-auto h-6 w-16" />
  ) : (
    <MetricValue
      align="end"
      className={cn('block whitespace-nowrap', emphasized && type.itemTitle)}
    >
      {value.toFixed(2)}%
    </MetricValue>
  )
}

function holdingName(row: Holding, tab: HoldingsTab) {
  if (tab === 'collateral') return row.name
  return ['nasdaq', 'nyse'].includes(row.native.caip2)
    ? getTokenName(row.name)
    : row.native.name
}

export function HoldingPerformance({
  row,
  loading = false,
}: {
  row: Holding
  loading?: boolean
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <PerformanceCell
        value={row.change === null ? null : row.change * 100}
        loading={loading}
      />
      {!loading && row.newlyAdded && row.change !== null && (
        <span
          className="inline-flex"
          data-table-focus={`performance-help-${row.address}`}
        >
          <HelpTooltip
            accessibleLabel="Price Change (7d)"
            content="This asset was added to the basket during this 7 day period"
          />
        </span>
      )}
    </div>
  )
}

export function Capitalization({
  value,
  loading = false,
}: {
  value: number | null
  loading?: boolean
}) {
  return loading ? (
    <Skeleton className="ml-auto h-6 w-16" />
  ) : (
    <MetricValue
      align="end"
      className={cn(
        'block whitespace-nowrap',
        value === null && 'text-supporting-foreground'
      )}
    >
      {value === null ? '—' : value === 0 ? '$0.00' : formatMarketCap(value)}
    </MetricValue>
  )
}
