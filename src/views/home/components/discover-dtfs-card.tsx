import { ROUTES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
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

const DiscoverDtfsCard = () => (
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
            className="flex min-w-0 items-center gap-2 rounded-full bg-card px-2 py-2"
          >
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              className="h-7 w-7 shrink-0 rounded-full"
            />
            <span className="text-sm text-foreground">{symbol}</span>
          </div>
        ))}
      </div>
    }
  />
)

export default DiscoverDtfsCard
