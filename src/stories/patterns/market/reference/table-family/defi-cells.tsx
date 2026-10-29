import {
  EntityIdentity,
  MarketTokenLogoStack as TokenLogoStack,
} from '../market-identity'
import { Button } from '@/components/button'
import { ArrowUpRight } from 'lucide-react'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import { Skeleton } from '@/components/design-system-v1/loading'
import { v1Typography } from '@/components/design-system-v1/typography'
import { tooltipSurfaceRecipe } from '@/components/design-system-v1/tooltip-surface'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MetricValue } from '@/components/metric'
import ChainLogo from '@/components/icons/ChainLogo'
import Beefy from '@/components/icons/Beefy'
import Curve from '@/components/icons/logos/Curve'
import Convex from '@/components/icons/logos/Convex'
import Yearn from '@/components/icons/logos/Yearn'
import Uniswap from '@/components/icons/logos/Uniswap'
import { formatCurrency } from '@/utils'
import { cn } from '@/lib/utils'
import { defiHelp, type DefiMetric, type DefiRow } from './defi-fixtures'

const projectIcons = {
  'curve-dex': <Curve />,
  'yearn-finance': <Yearn fontSize={16} />,
  'convex-finance': <Convex fontSize={16} />,
  beefy: <Beefy />,
  'uniswap-v3': <Uniswap />,
}

export function DefiIdentity({
  row,
  loading,
  includePlatform = false,
}: {
  row: DefiRow
  loading: boolean
  includePlatform?: boolean
}) {
  return (
    <EntityIdentity
      className="flex min-h-11 min-w-0 items-center gap-3"
      data-slot="defi-identity"
      aria-hidden={loading || undefined}
      mark={
        loading ? (
          <Skeleton className="h-8 w-[52px] shrink-0 rounded-full" />
        ) : (
          <TokenLogoStack
            tokens={row.tokens}
            size={32}
            overlap={row.tokens.length === 3 ? 11 : 2}
          />
        )
      }
      name={
        loading ? (
          <span className="relative block">
            <span className="invisible">{row.symbol}</span>
            <Skeleton className="absolute left-0 top-1 h-4 w-24 max-w-full" />
          </span>
        ) : (
          row.symbol
        )
      }
      wrapName
      nameLeading="compact"
      supporting={
        <span className="flex min-h-5 flex-wrap items-center gap-x-2 whitespace-normal">
          <span
            className="inline-flex h-5 items-center gap-1 whitespace-nowrap"
            data-slot="defi-pool-chain"
          >
            {loading ? (
              <Skeleton className="size-3 shrink-0" />
            ) : (
              <ChainLogo
                chain={row.chain}
                className="size-3 shrink-0"
                aria-hidden
              />
            )}
            <span className="relative">
              <span className={loading ? 'invisible' : undefined}>
                {row.chain}
              </span>
              {loading && <Skeleton className="absolute inset-x-0 top-1 h-3" />}
            </span>
          </span>
          {includePlatform && (
            <span
              className="inline-flex min-h-5 items-center gap-2 whitespace-nowrap"
              data-slot="defi-pool-platform"
            >
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                {loading ? (
                  <Skeleton className="size-3 shrink-0" />
                ) : (
                  <span
                    aria-hidden
                    data-slot="defi-platform-logo"
                    className="inline-flex size-3 shrink-0 items-center justify-center [&>svg]:size-3 [&>img]:size-3 [&>img]:object-contain"
                  >
                    {projectIcons[row.project as keyof typeof projectIcons]}
                  </span>
                )}
                <span className="relative">
                  <span className={loading ? 'invisible' : undefined}>
                    {row.projectName}
                  </span>
                  {loading && (
                    <Skeleton className="absolute inset-x-0 top-1 h-3" />
                  )}
                </span>
              </span>
            </span>
          )}
        </span>
      }
    />
  )
}

export function DefiPoolAction({
  row,
  loading,
  iconOnly = false,
}: {
  row: DefiRow
  loading: boolean
  iconOnly?: boolean
}) {
  if (loading)
    return (
      <Skeleton className={iconOnly ? 'size-8 rounded-full' : 'h-8 w-28'} />
    )
  const label = iconOnly ? `Open pool on ${row.projectName}` : 'View pool'
  const action = (
    <Button
      asChild
      size="compact"
      tone="secondary"
      trailingIcon={iconOnly ? undefined : <ArrowUpRight aria-hidden />}
      className={cn(
        'relative w-fit after:absolute after:inset-x-0 after:-inset-y-1.5',
        iconOnly && 'w-8 px-0 after:-inset-x-1.5'
      )}
    >
      <a
        href={row.url}
        target="_blank"
        rel="noopener noreferrer"
        data-table-focus={`pool-${row.id}`}
        aria-label={`${label} (opens in a new tab)`}
      >
        {iconOnly ? <ArrowUpRight aria-hidden /> : 'View pool'}
      </a>
    </Button>
  )
  if (!iconOnly) return action
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{action}</TooltipTrigger>
        <TooltipContent
          sideOffset={8}
          collisionPadding={8}
          className={tooltipSurfaceRecipe}
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function DefiPlatform({
  row,
  loading,
}: {
  row: DefiRow
  loading: boolean
}) {
  return loading ? (
    <div className="flex h-6 items-center gap-2" data-slot="defi-platform">
      <Skeleton className="size-5 shrink-0 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
  ) : (
    <EntityIdentity
      data-slot="defi-platform"
      className="flex"
      mark={
        <span
          aria-hidden
          data-slot="defi-platform-logo"
          className="inline-flex size-5 shrink-0 items-center justify-center [&>svg]:size-5 [&>img]:size-5 [&>img]:object-contain"
        >
          {projectIcons[row.project as keyof typeof projectIcons]}
        </span>
      }
      name={<span className={v1Typography.body}>{row.projectName}</span>}
    />
  )
}

export function DefiHelp() {
  return (
    <span
      className="inline-flex shrink-0 items-center"
      data-table-focus="help-apy"
    >
      <HelpTooltip
        accessibleLabel="APY"
        content={
          <div className="space-y-2">
            <p>{defiHelp.apy}</p>
            <p>Base APY: {defiHelp.apyBase}</p>
            <p>Reward APY: {defiHelp.apyReward}</p>
          </div>
        }
      />
    </span>
  )
}

export function DefiValue({
  row,
  field,
  loading,
  alignEnd = true,
}: {
  row: DefiRow
  field: DefiMetric
  loading: boolean
  alignEnd?: boolean
}) {
  const value = row[field]
  return loading ? (
    <div className={cn('flex h-6 items-center', alignEnd && 'justify-end')}>
      <Skeleton className="h-4 w-16" />
    </div>
  ) : (
    <MetricValue
      className={cn('block', value === null && 'text-supporting-foreground')}
    >
      {value === null
        ? '—'
        : field === 'tvlUsd'
          ? `$${formatCurrency(value, 0)}`
          : `${formatCurrency(value, 1)}%`}
    </MetricValue>
  )
}
