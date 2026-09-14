import { memo, useId } from 'react'
import { Link } from 'react-router-dom'
import { ChainBadgedLogo } from '@/components/entity-identity'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { Skeleton } from '@/components/design-system-v1/loading'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { useIsDesktop } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { getFolioRoute } from '@/utils'
import { FeatureCardAssetTicker } from '@/views/home/components/highlighted-dtfs/asset-ticker'
import { BACKING_LIMIT } from '@/views/home/components/highlighted-dtfs/constants'
import { useHighlightedCardVisibility } from '@/views/home/hooks/use-highlighted-dtf-animation'
import { DiscoverMoney } from './discover-cells'
import {
  DiscoverCardChart,
  type DiscoverCardLayout,
} from './discover-card-chart'
import type { DiscoverRow } from './discover-fixtures'
import { DiscoverCardMarket } from './discover-card-market'
import { DiscoverCardTickerSkeleton } from './discover-card-loading'

export const DiscoverCard = memo(function DiscoverCard({
  row,
  layout,
  loading,
}: {
  row: DiscoverRow
  layout: DiscoverCardLayout
  loading: boolean
}) {
  const title = useId()
  const isDesktop = useIsDesktop()
  const { cardRef, isAssetTickerVisible } =
    useHighlightedCardVisibility<HTMLAnchorElement>(isDesktop || loading)
  const assets = [...row.basket]
    .sort((a, b) => Number(b.weight ?? 0) - Number(a.weight ?? 0))
    .slice(0, BACKING_LIMIT)
    .map((asset) => ({
      key: asset.address,
      symbol: asset.symbol,
      weight:
        asset.weight?.trim() && Number.isFinite(Number(asset.weight))
          ? asset.weight
          : '—',
    }))
  const content = (
    <>
      <div className="flex flex-col overflow-hidden bg-inherit">
        <div className="flex min-w-0 flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            {loading ? (
              <Skeleton className="size-8 rounded-full" />
            ) : (
              <ChainBadgedLogo
                size="xl"
                chain={row.chainId}
                address={row.address}
                symbol={row.symbol}
                src={row.brand.icon}
                surface="structural"
              />
            )}
            {layout === 'compact' && (
              <DiscoverCardChart row={row} layout={layout} loading={loading} />
            )}
          </div>
          <div className="min-w-0 space-y-2">
            <div
              id={title}
              className={cn(type.panelTitle, 'break-words text-foreground')}
            >
              {loading ? (
                <div className="relative block">
                  <span className="invisible">{row.name}</span>
                  <Skeleton className="absolute inset-0 [mask-image:repeating-linear-gradient(to_bottom,currentColor_0,currentColor_20px,transparent_20px,transparent_26px)]" />
                </div>
              ) : (
                <h3>{row.name}</h3>
              )}
            </div>
            <DiscoverCardMarket row={row} loading={loading} />
            <div
              className={cn(
                type.supporting,
                'relative break-words text-supporting-foreground'
              )}
            >
              <span className={cn(loading && 'invisible')}>
                {row.brand.tags.length ? row.brand.tags.join(', ') : 'No tags'}
              </span>
              {loading && (
                <Skeleton className="absolute inset-0 [mask-image:repeating-linear-gradient(to_bottom,currentColor_0,currentColor_14px,transparent_14px,transparent_20px)]" />
              )}
            </div>
            {!loading && row.status !== 'active' && (
              <LifecycleStatusPill role="closed">Inactive</LifecycleStatusPill>
            )}
          </div>
        </div>
        {layout === 'full' && (
          <DiscoverCardChart row={row} layout={layout} loading={loading} />
        )}
      </div>
      <div
        data-slot="card-asset-ticker"
        aria-hidden="true"
        className={cn(
          'mx-1 motion-reduce:[&_*]:!animate-none group-focus-visible:[&_*]:[animation-play-state:paused]',
          !loading &&
            'group-hover:[&>div]:bg-interactive-content-hover group-hover:[&>div]:border-interactive-content-hover group-hover:[&_.from-card]:from-interactive-content-hover group-hover:[&_.via-card]:via-interactive-content-hover'
        )}
      >
        {loading ? (
          <DiscoverCardTickerSkeleton />
        ) : assets.length ? (
          <FeatureCardAssetTicker
            assets={assets}
            displayedVersionKey={`${row.chainId}-${row.address}`}
            isVisible={isAssetTickerVisible}
            selectedVersionName={row.name}
            transitionState="idle"
          />
        ) : (
          <div
            className={cn(
              type.supporting,
              'px-6 py-3 text-supporting-foreground'
            )}
          >
            No data
          </div>
        )}
      </div>
      {!loading && (
        <span className="sr-only">
          Basket:{' '}
          {assets.length
            ? assets
                .map((asset) => `${asset.symbol} ${asset.weight ?? '—'}%`)
                .join(', ')
            : 'No data'}
        </span>
      )}
      <div
        className={cn(
          type.supporting,
          'flex items-center justify-between gap-4 px-6 pb-6 pt-2'
        )}
      >
        <span className={cn(type.supporting, 'text-supporting-foreground')}>
          Market Cap:
        </span>
        <DiscoverMoney
          value={row.marketCap}
          compact
          loading={loading}
          textRole="supporting"
        />
      </div>
    </>
  )
  const className = cn(
    'group flex h-full min-w-0 flex-col gap-2 bg-card text-foreground',
    roles.focus.visibleInset
  )
  if (loading)
    return (
      <div
        data-testid="discover-card-skeleton"
        aria-hidden="true"
        className={className}
      >
        {content}
      </div>
    )
  return (
    <Link
      ref={cardRef}
      to={getFolioRoute(row.address, row.chainId)}
      aria-labelledby={title}
      data-testid="discover-card"
      data-table-focus={`name-${row.address}`}
      data-symbol={row.symbol}
      className={cn(
        className,
        'outline-none hover:no-underline',
        roles.interaction.contentHover
      )}
    >
      {content}
    </Link>
  )
})
