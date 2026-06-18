import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useLingui } from '@lingui/react/macro'
import { ArrowRight } from 'lucide-react'
import type { AssetTickerTransitionState } from '../../hooks/use-highlighted-dtf-animation'
import {
  BACKING_LIMIT,
  FEATURE_CARD_ASSET_TICKER_CLASS_NAME,
} from './constants'
import type { AssetTickerItem } from './types'
import { formatAssetWeight } from './utils'

const CollateralAssetItem = ({ asset }: { asset: AssetTickerItem }) => (
  <div className="flex shrink-0 items-center gap-1 rounded-full px-1.5 py-1">
    <span className="text-sm text-foreground ml-1">${asset.symbol}</span>
    <span className="text-sm text-legend">
      {formatAssetWeight(asset.weight)}%
    </span>
  </div>
)

export const FeatureCardAssetTicker = ({
  assets,
  displayedVersionKey,
  isVisible,
  selectedVersionName,
  transitionState,
}: {
  assets: AssetTickerItem[]
  displayedVersionKey: string
  isVisible: boolean
  selectedVersionName: string
  transitionState: AssetTickerTransitionState
}) => {
  const { t } = useLingui()
  const shouldScroll = assets.length > 1
  const renderedAssets = shouldScroll ? [...assets, ...assets] : assets

  return (
    <div className={FEATURE_CARD_ASSET_TICKER_CLASS_NAME}>
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 -right-px z-10 w-20 bg-gradient-to-l from-card via-card to-transparent opacity-100 transition-opacity duration-150',
          'lg:opacity-65 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100'
        )}
      />
      <div className="flex overflow-hidden pl-2 pr-12">
        <div
          className={cn(
            'will-change-transform',
            transitionState === 'exiting' &&
              '[animation:collateral-assets-chain-exit_180ms_ease-in_forwards]',
            transitionState === 'entering' &&
              '[animation:collateral-assets-chain-enter_220ms_ease-out_forwards]'
          )}
        >
          <div
            key={displayedVersionKey}
            className={cn(
              'flex w-max gap-0 motion-reduce:animate-none',
              shouldScroll &&
                isVisible &&
                '[animation:collateral-assets-scroll_18s_linear_infinite]',
              shouldScroll &&
                'lg:[animation:none] lg:group-hover:[animation:collateral-assets-scroll_18s_linear_infinite]'
            )}
          >
            {renderedAssets.map((asset, index) => (
              <CollateralAssetItem
                key={`${asset.key}-${index}`}
                asset={asset}
              />
            ))}
          </div>
        </div>
      </div>
      <Button
        variant="none"
        size="icon-rounded"
        className={cn(
          'absolute right-2 top-1/2 z-20 h-8 w-8 -translate-y-1/2 shrink-0 bg-muted text-foreground opacity-100 transition-colors duration-150',
          'hover:!bg-primary hover:!text-primary-foreground',
          'lg:bg-card lg:opacity-0 lg:group-hover:bg-muted lg:group-hover:opacity-100 lg:group-focus-within:opacity-100'
        )}
        aria-label={t`Open ${selectedVersionName}`}
      >
        <ArrowRight size={16} />
      </Button>
    </div>
  )
}

export const FeatureCardAssetTickerSkeleton = () => (
  <div className={FEATURE_CARD_ASSET_TICKER_CLASS_NAME}>
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 -right-px z-10 w-20 bg-gradient-to-l from-card via-card to-transparent opacity-100 transition-opacity duration-150',
        'lg:opacity-65 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100'
      )}
    />
    <div className="flex overflow-hidden pl-2 pr-12">
      <div className="flex w-max gap-0">
        {Array.from({ length: BACKING_LIMIT }).map((_, index) => (
          <div
            key={index}
            className="flex shrink-0 items-center gap-1 rounded-full px-1.5 py-1"
          >
            <Skeleton className="ml-1 h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-9 rounded-full" />
          </div>
        ))}
      </div>
    </div>
    <Skeleton className="absolute right-2 top-1/2 z-20 h-8 w-8 -translate-y-1/2 rounded-full bg-muted" />
  </div>
)
