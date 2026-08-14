import {
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Blend,
  Clock3,
  Fingerprint,
  Globe,
  Landmark,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  ChainBadgedLogo,
  EntityIdentity as CanonicalEntityIdentity,
  TokenLogoStack,
} from '@/components/entity-identity'
import TokenLogo from '@/components/token-logo'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'
import { READY_PRODUCT_FACING_REVIEWS } from './product-facing-component-audit'

const reviewLinks = new Map(
  READY_PRODUCT_FACING_REVIEWS.map((review) => [review.id, review.componentId])
)

const ProductFacingReviewBoard = () => (
  <section
    data-testid="product-component-board"
    className="space-y-4"
    aria-labelledby="product-component-heading"
  >
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <h2 id="product-component-heading" className="text-xl font-semibold">
            Product components
          </h2>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            Current evidence
          </span>
        </div>
        <p className="mt-1 max-w-3xl text-sm font-light text-muted-foreground">
          Real recurring product UI shown in component form. Review input is
          requested only when a specific system conflict or visual opportunity
          is identified.
        </p>
      </div>
      <p className="text-xs font-light text-muted-foreground">
        Source-grounded · no product migration
      </p>
    </div>

    <div className="grid gap-4 xl:grid-cols-3">
      <ReviewCard
        title="Information rows"
        description="Asset, transaction, and rich-record anatomy"
        to={`/internal/design-system/components/${reviewLinks.get('information-rows')}`}
      >
        <InformationRowSpecimen />
      </ReviewCard>
      <ReviewCard
        title="Metric roles"
        description="Centered headline metric reference"
        to={`/internal/design-system/components/${reviewLinks.get('metric-blocks')}`}
      >
        <MetricSpecimen />
      </ReviewCard>
      <ReviewCard
        title="Index navigation"
        description="Collapsed and hover-expanded current behavior"
        to={`/internal/design-system/components/${reviewLinks.get('product-navigation')}`}
      >
        <NavigationSpecimen />
      </ReviewCard>
      <ReviewCard
        title="Identity marks"
        description="Chain-badged DTF logos and overlapping asset stacks"
        to="/internal/design-system/components/entity-identity"
      >
        <IdentityMarkSpecimen />
      </ReviewCard>
    </div>
  </section>
)

const ReviewCard = ({
  title,
  description,
  to,
  children,
}: {
  title: string
  description: string
  to: string
  children: React.ReactNode
}) => (
  <article className="flex min-h-[34rem] flex-col overflow-hidden border border-border bg-card">
    <div className="flex items-start justify-between gap-4 border-b border-border p-4">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <Link
        to={to}
        aria-label={`Open ${title} component evidence`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
    <div className="flex flex-1 flex-col bg-secondary p-0.5">{children}</div>
  </article>
)

const InformationRowSpecimen = () => (
  <div className="flex h-full flex-col gap-0.5">
    <SpecimenGroup label="Comparable data">
      <div className="grid grid-cols-[minmax(0,1fr)_4.25rem_4.25rem] items-center gap-3 px-4 py-3 text-sm font-light">
        <CanonicalEntityIdentity
          density="compact"
          mark={<TokenLogo src="/svgs/wbtc.svg" size="xl" alt="Bitcoin" />}
          name="Bitcoin"
          supporting="$BTC"
        />
        <span className="text-right tabular-nums">71.00%</span>
        <span className="text-right tabular-nums text-destructive">
          −27.60%
        </span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_4.25rem_4.25rem] items-center gap-3 px-4 py-3 text-sm font-light">
        <CanonicalEntityIdentity
          density="compact"
          mark={<TokenLogo src="/svgs/weth.svg" size="xl" alt="Ethereum" />}
          name="Ethereum"
          supporting="$ETH"
        />
        <span className="text-right tabular-nums">12.70%</span>
        <span className="text-right tabular-nums text-destructive">
          −36.43%
        </span>
      </div>
    </SpecimenGroup>

    <SpecimenGroup label="Transaction history">
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3 text-sm font-light">
        <span className="font-medium">Redeem</span>
        <span className="text-right tabular-nums">
          $464.68 <span className="text-muted-foreground">(3.6)</span>
        </span>
        <span className="flex items-center justify-end gap-1 text-muted-foreground">
          6m <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </SpecimenGroup>

    <SpecimenGroup label="Navigable record" grow>
      <div className="flex flex-1 flex-col justify-between p-4">
        <p className="text-base font-medium leading-6">
          Extension of onchain voting and execution process
        </p>
        <div className="my-3 h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[68%] rounded-full bg-primary" />
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock3 className="h-4 w-4 text-primary" /> Pending execution
          </span>
          <span className="tabular-nums text-success">100%</span>
        </div>
      </div>
    </SpecimenGroup>
  </div>
)

const MetricSpecimen = () => (
  <div className="flex h-full flex-col bg-card">
    <p className="border-b border-border px-4 py-3 text-xs font-medium text-muted-foreground">
      Accepted reference · Homepage headline strip
    </p>
    <div className="grid flex-1 grid-cols-2 gap-px bg-border">
      <HeadlineMetric label="TVL" value="$531M" />
      <HeadlineMetric label="Mint volume" value="$1.7B" />
    </div>
  </div>
)

const HeadlineMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col justify-center bg-card p-4 text-center">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 text-xl font-light tabular-nums">{value}</p>
  </div>
)

const STACKED_ASSETS = [
  {
    symbol: 'WBTC',
    logo: '/svgs/wbtc.svg',
    address: 'wbtc',
    chain: ChainId.BSC,
  },
  {
    symbol: 'WETH',
    logo: '/svgs/weth.svg',
    address: 'weth',
    chain: ChainId.BSC,
  },
  {
    symbol: 'USDC',
    logo: '/svgs/usdc.svg',
    address: 'usdc',
    chain: ChainId.BSC,
  },
]

const IdentityMarkSpecimen = () => (
  <div className="flex h-full flex-col gap-0.5">
    <SpecimenGroup label="Canonical identity">
      <div className="flex items-center bg-card p-4">
        <CanonicalEntityIdentity
          mark={
            <ChainBadgedLogo
              src="/imgs/socials/cmc20.png"
              chain={ChainId.BSC}
              size="xl"
              alt="CMC20"
            />
          }
          name="CoinMarketCap 20 Index DTF"
          supporting="$CMC20 · BNB Chain"
        />
      </div>
      <SystemNote>
        Canonical candidate extracted from the strongest recent Index usage; the
        component now owns badge geometry and surface separation.
      </SystemNote>
    </SpecimenGroup>

    <SpecimenGroup label="Overlapping assets" grow>
      <div className="flex flex-1 items-center gap-3 px-4 py-6">
        <TokenLogoStack tokens={STACKED_ASSETS} size={24} />
        <span className="text-sm font-light text-muted-foreground">
          Three basket assets
        </span>
      </div>
      <SystemNote>
        Canonical candidate owns overlap order and surface-colored separating
        borders rather than requiring consumer selectors.
      </SystemNote>
    </SpecimenGroup>
  </div>
)

const SystemNote = ({ children }: { children: React.ReactNode }) => (
  <p className="border-t border-border px-4 py-3 text-xs font-light leading-5 text-muted-foreground">
    <span className="font-medium text-foreground">System note:</span> {children}
  </p>
)

const NavigationSpecimen = () => (
  <div className="grid h-full grid-cols-[5rem_minmax(0,1fr)] gap-0.5">
    <NavigationState label="Default" expanded={false} />
    <NavigationState label="On rail hover" expanded />
  </div>
)

const NavigationState = ({
  label,
  expanded,
}: {
  label: string
  expanded: boolean
}) => (
  <div className="flex min-w-0 flex-col bg-card">
    <p className="border-b border-border px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div
      className={cn(
        'flex flex-1 flex-col px-5 py-7',
        expanded && 'rounded-2xl border-2 border-card bg-background/50'
      )}
    >
      <div className="flex h-10 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <img
            src="/imgs/socials/cmc20.png"
            alt="CMC20"
            className="h-6 w-6 rounded-full object-cover"
          />
        </span>
        {expanded && (
          <span className="min-w-0 truncate text-base font-medium">CMC20</span>
        )}
      </div>
      <div className="my-4 h-px bg-border" />
      <div className="space-y-3">
        <NavItem
          icon={<Globe />}
          label="Overview"
          current
          expanded={expanded}
        />
        <NavItem
          icon={<Blend />}
          label="Swap"
          expanded={expanded}
          hovered={expanded}
        />
        <NavItem icon={<Landmark />} label="Governance" expanded={expanded} />
        <NavItem
          icon={<ArrowLeftRight />}
          label="Auctions"
          expanded={expanded}
        />
        <NavItem
          icon={<Fingerprint />}
          label="Details + Roles"
          expanded={expanded}
        />
      </div>
    </div>
  </div>
)

const NavItem = ({
  icon,
  label,
  expanded,
  current = false,
  hovered = false,
}: {
  icon: React.ReactNode
  label: string
  expanded: boolean
  current?: boolean
  hovered?: boolean
}) => (
  <div
    className={cn(
      'flex h-10 items-center gap-3 rounded-full text-base',
      current || hovered ? 'text-primary' : 'text-foreground'
    )}
  >
    <span
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors [&_svg]:h-4 [&_svg]:w-4 [&_svg]:stroke-[1.5]',
        current
          ? 'border-transparent bg-primary/10'
          : hovered
            ? 'border-border bg-card'
            : 'border-transparent bg-transparent'
      )}
    >
      {icon}
    </span>
    {expanded && <span className="min-w-0 truncate">{label}</span>}
  </div>
)

const SpecimenGroup = ({
  label,
  grow = false,
  children,
}: {
  label: string
  grow?: boolean
  children: React.ReactNode
}) => (
  <section className={cn('bg-card', grow && 'flex flex-1 flex-col')}>
    <p className="border-b border-border px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    {children}
  </section>
)

export default ProductFacingReviewBoard
