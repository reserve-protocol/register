import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Trans } from '@lingui/react/macro'
import { Link } from 'react-router-dom'
import { FeatureCardAssetTickerSkeleton } from './asset-ticker'
import {
  FEATURE_CARD_CLASS_NAME,
  FEATURE_CARD_HEADER_CLASS_NAME,
  FEATURE_CARD_MEDIA_CLASS_NAME,
} from './constants'
import { FEATURED_DTFS, getFeaturedRoute, type FeaturedIdentity } from './featured-dtfs'
import { PerformanceChartSkeleton } from './performance-chart'
import { FeatureCardTranscriptSkeleton } from './skeletons'

// A real, clickable card that shows the DTF's static identity (logo, name,
// symbol) immediately while the featured endpoint is still loading. Price,
// percentage change, chart, and exposure ticker stay as skeletons until the
// live card takes over. Layout mirrors IndexDTFFeatureCardSkeleton so the swap
// to the hydrated card is seamless.
const IndexDTFFeatureIdentityCard = ({ dtf }: { dtf: FeaturedIdentity }) => (
  <Link
    to={getFeaturedRoute(dtf)}
    className={cn(FEATURE_CARD_CLASS_NAME, 'select-none')}
  >
    <div className={FEATURE_CARD_MEDIA_CLASS_NAME}>
      <div className={FEATURE_CARD_HEADER_CLASS_NAME}>
        <div className="flex min-w-0 items-start justify-between">
          <div className="relative w-fit flex-shrink-0">
            <TokenLogo
              address={dtf.address}
              chain={dtf.chainId}
              src={dtf.logo}
              symbol={dtf.symbol}
              size="xl"
            />
            <ChainLogo
              chain={dtf.chainId}
              width={16}
              height={16}
              className="absolute -bottom-0.5 -right-1 rounded-md border-2 border-secondary bg-card group-hover:border-card"
            />
          </div>

          <div className="relative flex h-8 shrink-0 items-center justify-end">
            <span className="inline-flex h-8 items-center rounded-full bg-primary px-3.5 text-sm font-medium text-primary-foreground opacity-100 transition-opacity duration-150 ease-out lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
              <Trans context="DTF card">Buy</Trans>
            </span>
          </div>
        </div>

        <div className="w-full min-w-0">
          <div className="flex min-h-[48px] min-w-0 items-end">
            <div className="flex min-w-0 items-end gap-2">
              <h3 className="min-w-0 text-xl font-normal leading-tight text-foreground [text-wrap:pretty] transition-colors lg:group-hover:text-primary dark:lg:group-hover:text-foreground">
                {dtf.name}
              </h3>
            </div>
          </div>
          <div className="mt-1.5 flex w-full min-w-0 items-center justify-between gap-3 text-base text-legend">
            <span className="flex min-w-0 items-center gap-1 truncate">
              <Skeleton className="h-5 w-14" />
              <span>· ${dtf.symbol}</span>
            </span>
            <Skeleton className="h-5 w-20 shrink-0" />
          </div>
        </div>
      </div>

      <PerformanceChartSkeleton className="h-52" />
    </div>
    <FeatureCardAssetTickerSkeleton />
    <FeatureCardTranscriptSkeleton />
  </Link>
)

export const IndexDTFFeatureIdentityCards = () => (
  <>
    {FEATURED_DTFS.map((dtf) => (
      <IndexDTFFeatureIdentityCard key={dtf.key} dtf={dtf} />
    ))}
  </>
)
