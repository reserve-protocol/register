import type { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { ChainId } from '@/utils/chains'
import { DiscoverIndexDTFCard } from '@/views/home/components/discover-index-dtf'
import { IndexDTFFeatureCard } from '@/views/home/components/highlighted-dtfs'
import { toHighlightedDtf } from '@/views/home/components/highlighted-dtfs/utils'
import type { FeaturedDTFItem } from '@/views/home/hooks/use-featured-dtfs'
import featuredDtfSnapshot from '../../../../e2e/snapshots/shared/featured-dtfs.json'

const featuredSnapshotData = featuredDtfSnapshot.data as unknown as {
  items: Record<string, FeaturedDTFItem[]>
}
const capturedHomeFeaturedItem = featuredSnapshotData.items.buildout?.[0]
const HOME_FEATURE_CARD_FIXTURE = capturedHomeFeaturedItem
  ? toHighlightedDtf({
      key: 'buildout',
      versions: [capturedHomeFeaturedItem],
    })
  : null

if (!HOME_FEATURE_CARD_FIXTURE) {
  throw new Error('Missing captured Home feature-card fixture')
}

const DISCOVER_CARD_FIXTURE: IndexDTFItem = {
  address: '0x2f8A339B5889FfaC4c5A956787cdA593b3c36867',
  symbol: 'CMC20',
  name: 'CoinMarketCap 20 Index DTF',
  price: 127.85036526305007,
  fee: 0.01,
  marketCap: 6085684.521488483,
  basket: [
    {
      address: '0x0000000000000000000000000000000000000001',
      symbol: 'BTC',
      weight: '19.8',
    },
    {
      address: '0x0000000000000000000000000000000000000002',
      symbol: 'ETH',
      weight: '17.4',
    },
    {
      address: '0x0000000000000000000000000000000000000003',
      symbol: 'BNB',
      weight: '8.6',
    },
    {
      address: '0x0000000000000000000000000000000000000004',
      symbol: 'SOL',
      weight: '7.9',
    },
  ],
  // Captured CMC20 1M history, retained here so the card's dominant chart
  // renders with representative density without coupling the lab bundle to an
  // E2E snapshot import.
  performance: [
    { timestamp: 1781038582, value: 125.22225138018776 },
    { timestamp: 1781124979, value: 123.77628927544893 },
    { timestamp: 1781211372, value: 127.14146238634035 },
    { timestamp: 1781297774, value: 127.20211233221704 },
    { timestamp: 1781384162, value: 128.75842487896776 },
    { timestamp: 1781470579, value: 128.29020481047527 },
    { timestamp: 1781556979, value: 134.70684916012172 },
    { timestamp: 1781643368, value: 132.9896199609502 },
    { timestamp: 1781729775, value: 130.0237505638302 },
    { timestamp: 1781816176, value: 127.41839943145617 },
    { timestamp: 1781902580, value: 127.17460942876674 },
    { timestamp: 1781988980, value: 128.80135518448438 },
    { timestamp: 1782075414, value: 128.625606666978 },
    { timestamp: 1782161817, value: 129.57257142156035 },
    { timestamp: 1782248163, value: 125.31054822870874 },
    { timestamp: 1782334582, value: 122.53603480420695 },
    { timestamp: 1782420981, value: 119.16773549235624 },
    { timestamp: 1782507379, value: 120.26913739476095 },
    { timestamp: 1782593780, value: 121.01410402410646 },
    { timestamp: 1782680168, value: 119.81732389843775 },
    { timestamp: 1782766581, value: 121.78938898654262 },
    { timestamp: 1782852978, value: 118.53745921213327 },
    { timestamp: 1782939403, value: 121.50503960196635 },
    { timestamp: 1783025767, value: 124.53396667819204 },
    { timestamp: 1783112178, value: 127.85490765397807 },
    { timestamp: 1783198579, value: 128.95902882484467 },
    { timestamp: 1783284979, value: 127.94399090334065 },
    { timestamp: 1783371366, value: 129.77205623867604 },
    { timestamp: 1783457780, value: 129.1363586743535 },
    { timestamp: 1783544181, value: 125.90502217542101 },
    { timestamp: 1783630577, value: 127.8711400038862 },
  ],
  performancePercent: 2.0987594887454004,
  chainId: ChainId.BSC,
  status: 'active',
  brand: { icon: '/imgs/socials/cmc20.png' },
  priceChange: { period: '1m', percent: 2.0987594887454004 },
}

const HOME_FEATURE_CARD_FOUNDATION_CLASSES =
  '[&>a]:!gap-2 [&>a]:!rounded-none [&>a]:!p-2 [&>a>div:first-child]:!rounded-lg [&>a>div:first-child>div:first-child]:!gap-4 [&>a>div:first-child>div:first-child]:!p-6 [&_[data-feature-card-market-row]]:!mt-2 [&_[data-feature-card-supporting-row]]:!px-6 [&_[data-feature-card-title-slot]]:!min-h-0 [&_[data-feature-card-title-slot]]:!items-start'

export const HomeFeatureCardOverviewSpecimen = () => (
  <div
    data-testid="home-feature-card-overview-specimen"
    data-source-point-count={HOME_FEATURE_CARD_FIXTURE.performance.length}
    className={HOME_FEATURE_CARD_FOUNDATION_CLASSES}
  >
    <IndexDTFFeatureCard dtf={HOME_FEATURE_CARD_FIXTURE} />
  </div>
)

const CardContentRegionReview = () => (
  <section
    data-testid="card-content-region-review"
    className="space-y-8"
    aria-labelledby="card-content-region-review-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">Canonicalization check</p>
      <h2
        id="card-content-region-review-title"
        className="mt-1 text-xl font-medium"
      >
        Home feature card foundation alignment
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        The production Home card is the authoritative design. This check renders
        that actual component with captured Home data and applies only the named
        foundation corrections below. Missing lab states never authorize their
        removal; the compact Discover adaptation is supporting evidence only.
      </p>
    </div>

    <div className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,28rem)_minmax(18rem,1fr)]">
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Primary evidence · Home featured card
          </p>
          <div
            data-testid="home-feature-card-source"
            data-source-point-count={
              HOME_FEATURE_CARD_FIXTURE.performance.length
            }
            className={HOME_FEATURE_CARD_FOUNDATION_CLASSES}
          >
            <IndexDTFFeatureCard dtf={HOME_FEATURE_CARD_FIXTURE} />
          </div>
        </div>

        <aside className="border border-border bg-card p-4 text-sm font-light leading-6 text-muted-foreground">
          <p className="font-medium text-foreground">Review only this delta</p>
          <p className="mt-2">
            Does the existing Home card still feel right after changing only its
            outer shell to square, its shell inset and contained-media radius to
            8px, its primary content inset to 24px, and its internal region gap
            to 16px—while keeping the directly related name and market row 8px
            apart?
          </p>
          <p className="mt-5 font-medium text-foreground">
            Preservation contract
          </p>
          <p className="mt-2">
            Full chart density, pre/post-launch treatment, launch marker and
            labels, identity and market context, exposure ticker, transcript and
            video behavior, chain variants, and whole-card interaction remain
            authoritative existing behavior. They must survive extraction even
            when one is not visible in a static review moment.
          </p>
          <p className="mt-5 font-medium text-foreground">
            What acceptance records
          </p>
          <p className="mt-2">
            Approval accepts only the named foundation corrections above and
            authorizes a preservation-first extraction. It does not approve an
            incomplete reconstruction or permit unspecified source behavior to
            be removed.
          </p>
        </aside>
      </div>

      <div className="border-t border-border pt-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,28rem)_minmax(18rem,1fr)]">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">
              Supporting evidence · Discover compact adaptation
            </p>
            <div
              data-testid="discover-feature-card-source"
              className="[&>div>a]:!gap-2 [&>div>a]:!rounded-none [&>div>a]:!p-2 [&>div>a>div:first-child]:!rounded-lg [&>div>a>div:first-child>div:first-child]:!gap-4 [&>div>a>div:first-child>div:first-child]:!p-6 [&_[data-feature-card-market-row]]:!mt-2 [&_[data-feature-card-supporting-row]]:!px-6 [&_[data-feature-card-title-slot]]:!min-h-0 [&_[data-feature-card-title-slot]]:!items-start"
            >
              <DiscoverIndexDTFCard dtf={DISCOVER_CARD_FIXTURE} />
            </div>
          </div>

          <div className="border border-border bg-card p-4 text-sm font-light leading-6 text-muted-foreground">
            <p className="font-medium text-foreground">Why this is secondary</p>
            <p className="mt-2">
              Discover keeps the same identity and whole-card affordance but
              moves the chart into the header and replaces the Home transcript
              with a compact metric row. It tests whether the source hierarchy
              adapts; it is not the visual source being approved.
            </p>
            <p className="mt-5 font-medium text-foreground">Already resolved</p>
            <p className="mt-2">
              Structural page regions stay square, white, and ordinarily use a
              24px content axis. Layout—not Card—owns selective substrate-reveal
              corners.
            </p>
            <p className="mt-5 font-medium text-foreground">Leave for later</p>
            <p className="mt-2">
              Final API, non-media families, responsive density and truncation,
              loading and disabled states, chart internals, and production
              migration.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default CardContentRegionReview
