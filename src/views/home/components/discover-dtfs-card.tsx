import { formatCurrency } from '@/utils'
import { RESERVE_API, ROUTES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { HomeCard } from './home-card'

const BRAND_ICONS = 'https://l5394zf57b.ufs.sh/f'

const DISCOVER_DTFS = [
  {
    symbol: 'CMC20',
    logo: `${BRAND_ICONS}/mupND8QUUvXxhO6t9I2BbMt4sV2Y6jmzwPSZ3Hrav0gfieuo`,
  },
  {
    symbol: 'PHOTON',
    logo: `${BRAND_ICONS}/mupND8QUUvXxYmQhYtkGhrj2ScsDNeUp3lRftPgCi0ZM65Vz`,
  },
  {
    symbol: 'MAG7',
    logo: `${BRAND_ICONS}/mupND8QUUvXxzqKDLfYQHYMkBg1Lxv2Gn7Nsbhq6KaVwfopl`,
  },
  {
    symbol: 'OPEN',
    logo: `${BRAND_ICONS}/mupND8QUUvXxqD7AIQfxfH57h2mseoNual3tKBRCYyvnS1E8`,
  },
  { symbol: 'ETH+', logo: '/svgs/ethplus.svg' },
  { symbol: 'USD3', logo: '/svgs/usd3.svg' },
  {
    symbol: 'BUILDOUT',
    logo: `${BRAND_ICONS}/mupND8QUUvXxyHeh2QrX3EJomHD1USwYFd2GKiBg5a8eIx7n`,
  },
  {
    symbol: 'POWER',
    logo: `${BRAND_ICONS}/mupND8QUUvXxZKOsPr8JmlcRC50zSbLNDr2MEexXdkwT78ah`,
  },
  {
    symbol: 'ROBOTS',
    logo: `${BRAND_ICONS}/mupND8QUUvXxmEIFouUUvXxgOp9n53Rqlys7HtMJG1oZVT6a`,
  },
  {
    symbol: 'NEOCLOUD',
    logo: `${BRAND_ICONS}/mupND8QUUvXxSLxvYczdsT15PwoUNnDvJ3hXEatCMQxeHuGm`,
  },
]

type DiscoverListItem = { symbol: string; marketCap?: number }

const useMarketCaps = () =>
  useQuery({
    queryKey: ['home-discover-market-caps'],
    queryFn: async () => {
      const res = await fetch(`${RESERVE_API}v1/discover/dtfs`)
      if (!res.ok) throw new Error(`Discover DTFs: ${res.status}`)
      const caps = new Map<string, number>()
      for (const { symbol, marketCap = 0 } of (await res.json()) as DiscoverListItem[])
        caps.set(symbol, Math.max(caps.get(symbol) ?? 0, marketCap))
      return caps
    },
    staleTime: 10 * 60 * 1000,
  })

const DiscoverDtfsCard = () => {
  const { data: marketCaps } = useMarketCaps()
  return (
  <HomeCard
    href={ROUTES.DISCOVER}
    cta="discover_dtfs"
    className="md:col-span-2"
    icon={
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
        aria-hidden="true"
      >
        <ArrowRight size={18} />
      </span>
    }
    title={<Trans>Discover more DTFs</Trans>}
    mediaClassName="h-[300px] sm:h-[240px]"
    media={
      <div className="grid h-full grid-cols-2 content-center gap-3 px-5 sm:grid-cols-3">
        {DISCOVER_DTFS.map(({ symbol, logo }) => (
          <div
            key={symbol}
            className="flex min-w-0 items-center gap-2 rounded-full border border-border bg-card px-2 py-2"
          >
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              className="h-7 w-7 shrink-0 rounded-full"
            />
            <span className="truncate text-sm text-foreground">{symbol}</span>
            {!!marketCaps?.get(symbol) && (
              <span className="ml-auto pr-2 text-sm tabular-nums text-legend">
                $
                {formatCurrency(marketCaps.get(symbol)!, 1, {
                  notation: 'compact',
                  compactDisplay: 'short',
                  minimumFractionDigits: 0,
                })}
              </span>
            )}
          </div>
        ))}
      </div>
    }
    description={
      <Trans>
        Index and Yield DTFs are onchain portfolios in a single token. Browse
        all of them, with prices, baskets and performance.
      </Trans>
    }
  />
  )
}

export default DiscoverDtfsCard
