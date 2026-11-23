import { Trans, useLingui } from '@lingui/react/macro'
import { Globe2 } from 'lucide-react'
import { useMemo } from 'react'
import {
  COUNTRIES,
  COUNTRY_COLORS,
  COUNTRY_COUNT,
  CountryService,
} from '../data/countries'
import ActiveMap from './active-map'
import { AutoTicker, HomeCard } from './home-card'

const CUSTODIAL_COUNT = COUNTRIES.custodial.length
const SELF_CUSTODY_COUNT = COUNTRIES.selfCustody.length
const SERVICES: CountryService[] = ['custodial', 'selfCustody']

const Legend = ({
  service,
  children,
}: {
  service: CountryService
  children: React.ReactNode
}) => (
  <span className="flex items-center gap-2 text-xs text-legend">
    <span
      className="h-2 w-2 rounded-full"
      style={{ background: COUNTRY_COLORS[service] }}
      aria-hidden="true"
    />
    {children}
  </span>
)

const CountriesCard = () => {
  const { t, i18n } = useLingui()
  const tickerItems = useMemo(() => {
    const names = new Intl.DisplayNames(i18n.locale, { type: 'region' })
    return SERVICES.flatMap((service) =>
      COUNTRIES[service].map(({ code, name }) => ({
        key: code,
        label: names.of(code) ?? name,
        color: COUNTRY_COLORS[service],
      }))
    )
  }, [i18n.locale])

  return (
    <HomeCard
      icon={
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-foreground"
          aria-hidden="true"
        >
          <Globe2 size={18} strokeWidth={1.75} />
        </span>
      }
      title={
        <>
          {t`Live in ${COUNTRY_COUNT} countries`}
          <span className="mt-1 block text-sm text-legend">
            <Trans>Focused on Latin America first</Trans>
          </span>
        </>
      }
      mediaClassName="h-[230px]"
      media={
        <div className="flex h-full flex-col items-center justify-center gap-2 px-1">
          <ActiveMap className="h-full w-auto max-w-full" />
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Legend service="custodial">
              <Trans>Full custodial service ({CUSTODIAL_COUNT})</Trans>
            </Legend>
            <Legend service="selfCustody">
              <Trans>Self-custody investment layer ({SELF_CUSTODY_COUNT})</Trans>
            </Legend>
          </div>
        </div>
      }
      ticker={<AutoTicker items={tickerItems} />}
      description={
        <Trans>
          UGLYCASH offers full service in {CUSTODIAL_COUNT} countries and
          self-custody investing in the US.
        </Trans>
      }
    />
  )
}

export default CountriesCard
