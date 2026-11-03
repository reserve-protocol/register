import { Trans, useLingui } from '@lingui/react/macro'
import { Globe2 } from 'lucide-react'
import { ROUTES } from '@/utils/constants'
import { HomeCard, AutoTicker } from './card-shell'
import ActiveMap from '../shared/active-map'
import { V26_COUNTRY_COLORS, V26_COUNTRY_COUNT, V26_COUNTRY_GROUPS } from '../mock/v26-countries'
import { cn } from '@/lib/utils'
import { FEATURE_CARD_ASSET_TICKER_CLASS_NAME } from '@/views/home/components/highlighted-dtfs/constants'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'

const GlobeIcon = () => (
  <span
    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground"
    aria-hidden="true"
  >
    <Globe2 size={18} strokeWidth={1.75} />
  </span>
)

const DISCOVER_DTFS = [
  {
    label: 'CMC20',
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxhO6t9I2BbMt4sV2Y6jmzwPSZ3Hrav0gfieuo',
  },
  {
    label: 'PHOTON',
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxYmQhYtkGhrj2ScsDNeUp3lRftPgCi0ZM65Vz',
  },
  {
    label: 'MAG7',
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxzqKDLfYQHYMkBg1Lxv2Gn7Nsbhq6KaVwfopl',
  },
  {
    label: 'OPEN',
    src: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxqD7AIQfxfH57h2mseoNual3tKBRCYyvnS1E8',
  },
  { label: 'ETH+', src: 'https://app.reserve.org/svgs/ethplus.svg' },
  { label: 'USD3', src: 'https://app.reserve.org/svgs/usd3.svg' },
]

const DiscoverVisual = () => (
  <div className="grid h-full grid-cols-2 content-center gap-3 px-7 sm:grid-cols-3">
    {DISCOVER_DTFS.map((dtf) => (
      <div key={dtf.label} className="flex items-center gap-2 rounded-full bg-card px-2 py-2">
        <img src={dtf.src} alt="" aria-hidden="true" className="h-7 w-7 rounded-full" />
        <span className="text-sm text-foreground">{dtf.label}</span>
      </div>
    ))}
  </div>
)

const Legend = ({ color, children }: { color: string; children: ReactNode }) => (
  <span className="flex items-center gap-2 text-xs text-legend">
    <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden="true" />
    {children}
  </span>
)

export const CountriesCardV26 = () => {
  const { t } = useLingui()
  const custodialCount = V26_COUNTRY_GROUPS.custodial.length
  const selfCustodyCount = V26_COUNTRY_GROUPS.selfCustody.length
  const tickerItems = [
    ...V26_COUNTRY_GROUPS.custodial.map((label) => ({
      key: `custodial-${label}`,
      label,
      color: V26_COUNTRY_COLORS.custodial,
    })),
    ...V26_COUNTRY_GROUPS.selfCustody.map((label) => ({
      key: `self-custody-${label}`,
      label,
      color: V26_COUNTRY_COLORS.selfCustody,
    })),
  ]

  return (
    <HomeCard
      icon={<GlobeIcon />}
      title={t`Live in ${V26_COUNTRY_COUNT} countries`}
      mediaClassName="h-[230px]"
      media={
        <div className="flex h-full flex-col items-center justify-center gap-2 px-1">
          <ActiveMap
            dataset="global"
            crop="world"
            countryGroups={V26_COUNTRY_GROUPS}
            countryColors={V26_COUNTRY_COLORS}
            className="h-full w-auto max-w-full"
          />
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Legend color={V26_COUNTRY_COLORS.custodial}>
              <Trans>Full custodial service ({custodialCount})</Trans>
            </Legend>
            <Legend color={V26_COUNTRY_COLORS.selfCustody}>
              <Trans>Self-custody investment layer ({selfCustodyCount})</Trans>
            </Legend>
          </div>
        </div>
      }
      tickerSlot={<AutoTicker items={tickerItems} smooth />}
      description={
        <Trans>
          Full custodial service is available in {custodialCount} countries; the
          self-custody investment layer reaches {selfCustodyCount} more.
        </Trans>
      }
    />
  )
}

export const DiscoverDtfsCardV26 = () => (
  <HomeCard
    href={ROUTES.DISCOVER}
    icon={<span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-hidden="true"><ArrowRight size={18} /></span>}
    title={<Trans>Discover more DTFs</Trans>}
    value="CMC20 · PHOTON · MAG7 · OPEN · ETH+ · USD3"
    media={<DiscoverVisual />}
    tickerSlot={
      <div className={cn(FEATURE_CARD_ASSET_TICKER_CLASS_NAME, 'px-3 py-3')}>
        <p className="text-sm text-legend"><Trans>Index and yield DTFs, all in one place.</Trans></p>
      </div>
    }
    description={<Trans>Explore more index and yield DTFs in one list.</Trans>}
  />
)
