import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import useIndexDTFList, { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { trackClick } from '@/hooks/useTrackPage'
import { cn } from '@/lib/utils'
import { getFolioRoute, getTokenRoute } from '@/utils'
import { ETHPLUS_ADDRESS, USD3_ADDRESS } from '@/utils/addresses'
import { ChainId } from '@/utils/chains'
import { ROUTES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usd, usdCompact } from '../utils'

const BRAND_ICONS = 'https://l5394zf57b.ufs.sh/f'

type DiscoverDtf = { symbol: string; name: string; logo: string; route?: string }

// Index DTFs take their route and numbers from the discover list; the two Yield DTFs are not in it.
const DISCOVER_DTFS: DiscoverDtf[] = [
  {
    symbol: 'CMC20',
    name: 'CoinMarketCap 20 Index DTF',
    logo: `${BRAND_ICONS}/mupND8QUUvXxhO6t9I2BbMt4sV2Y6jmzwPSZ3Hrav0gfieuo`,
  },
  {
    symbol: 'PHOTON',
    name: 'Reserve AI Photonics DTF',
    logo: `${BRAND_ICONS}/mupND8QUUvXxYmQhYtkGhrj2ScsDNeUp3lRftPgCi0ZM65Vz`,
  },
  {
    symbol: 'MAG7',
    name: 'Reserve Magnificent 7 DTF',
    logo: `${BRAND_ICONS}/mupND8QUUvXxzqKDLfYQHYMkBg1Lxv2Gn7Nsbhq6KaVwfopl`,
  },
  {
    symbol: 'OPEN',
    name: 'Open Stablecoin Index',
    logo: `${BRAND_ICONS}/mupND8QUUvXxqD7AIQfxfH57h2mseoNual3tKBRCYyvnS1E8`,
  },
  {
    symbol: 'ETH+',
    name: 'Ethereum+',
    logo: '/svgs/ethplus.svg',
    route: getTokenRoute(ETHPLUS_ADDRESS[ChainId.Mainnet], ChainId.Mainnet),
  },
  {
    symbol: 'USD3',
    name: 'Web 3 Dollar',
    logo: '/svgs/usd3.svg',
    route: getTokenRoute(USD3_ADDRESS[ChainId.Mainnet], ChainId.Mainnet),
  },
  {
    symbol: 'BUILDOUT',
    name: 'Reserve AI Infrastructure DTF',
    logo: `${BRAND_ICONS}/mupND8QUUvXxyHeh2QrX3EJomHD1USwYFd2GKiBg5a8eIx7n`,
  },
  {
    symbol: 'POWER',
    name: 'Reserve AI Power DTF',
    logo: `${BRAND_ICONS}/mupND8QUUvXxZKOsPr8JmlcRC50zSbLNDr2MEexXdkwT78ah`,
  },
  {
    symbol: 'ROBOTS',
    name: 'Reserve Robotics DTF',
    logo: `${BRAND_ICONS}/mupND8QUUvXxmEIFouUUvXxgOp9n53Rqlys7HtMJG1oZVT6a`,
  },
  {
    symbol: 'NEOCLOUD',
    name: 'Reserve AI Capacity & Neocloud DTF',
    logo: `${BRAND_ICONS}/mupND8QUUvXxSLxvYczdsT15PwoUNnDvJ3hXEatCMQxeHuGm`,
  },
]

const Row = ({
  label,
  children,
}: {
  label: React.ReactNode
  children: React.ReactNode
}) => (
  <div className="flex justify-between gap-6 text-sm">
    <span className="text-legend">{label}</span>
    <span className="tabular-nums">{children}</span>
  </div>
)

const DtfPill = ({ dtf, live }: { dtf: DiscoverDtf; live?: IndexDTFItem }) => {
  const route =
    dtf.route ??
    (live ? getFolioRoute(live.address, live.chainId) : ROUTES.DISCOVER)
  const change = live?.priceChange?.percent
  return (
    <HoverCard openDelay={150} closeDelay={80}>
      <HoverCardTrigger asChild>
        <Link
          to={route}
          onClick={() =>
            trackClick('home', 'discover_dtf', live?.address, dtf.symbol, live?.chainId)
          }
          className="flex items-center gap-2 rounded-full bg-card py-2 pl-2 pr-4 text-sm transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground focus-visible:outline-none"
        >
          <img
            src={dtf.logo}
            alt=""
            aria-hidden="true"
            className="h-7 w-7 shrink-0 rounded-full"
          />
          {dtf.symbol}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent side="top" className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <img
            src={dtf.logo}
            alt=""
            aria-hidden="true"
            className="h-9 w-9 shrink-0 rounded-full"
          />
          <div className="min-w-0">
            <p className="truncate font-medium">{live?.name ?? dtf.name}</p>
            <p className="text-sm text-legend">${dtf.symbol}</p>
          </div>
        </div>
        {live && (
          <div className="flex flex-col gap-1 border-t border-border pt-3">
            <Row label={<Trans>Price</Trans>}>{`$${live.price.toFixed(2)}`}</Row>
            <Row label={<Trans>Market Cap</Trans>}>
              {live.marketCap < 1000
                ? usd(live.marketCap)
                : usdCompact(live.marketCap)}
            </Row>
            {change !== undefined && (
              <Row label={live.priceChange?.period ?? '1m'}>
                <span
                  className={cn(
                    change >= 0 ? 'text-success' : 'text-destructive'
                  )}
                >
                  {`${change >= 0 ? '+' : ''}${change.toFixed(2)}%`}
                </span>
              </Row>
            )}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}

const DiscoverDtfsCard = () => {
  const { data } = useIndexDTFList()
  const liveBySymbol = new Map<string, IndexDTFItem>()
  for (const item of data ?? [])
    if (!liveBySymbol.has(item.symbol)) liveBySymbol.set(item.symbol, item)

  return (
    <section className="rounded-3xl bg-card p-1 md:col-span-2 lg:bg-background">
      <div className="flex flex-col gap-4 rounded-[20px] bg-gradient-to-b from-secondary to-card p-5 lg:from-secondary/80">
        <Link
          to={ROUTES.DISCOVER}
          onClick={() => trackClick('home', 'discover_dtfs')}
          className="group/discover flex items-center gap-3 self-start"
        >
          <h2 className="text-xl leading-tight">
            <Trans>Discover more DTFs</Trans>
          </h2>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover/discover:translate-x-1"
            aria-hidden="true"
          >
            <ArrowRight size={18} />
          </span>
        </Link>
        <div className="flex flex-wrap gap-2">
          {DISCOVER_DTFS.map((dtf) => (
            <DtfPill
              key={dtf.symbol}
              dtf={dtf}
              live={liveBySymbol.get(dtf.symbol)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default DiscoverDtfsCard
