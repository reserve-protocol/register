import { Trans, useLingui } from '@lingui/react/macro'
import { AnimLeft } from '../shared/grid-left'
import { EusdGlobe } from '../shared/hero-anims'
import GridStage from '../shared/grid-stage'
import HomeFooter from '../shared/home-footer'
import { DataNote } from '../shared/page-bits'
import {
  FintechCardV18,
  HeldCardV18,
  TransactionsCardV18,
  UglyCashCardV18,
  VolumeCardV18,
} from '../shared/v18-cards'
import { CountriesCardV26, DiscoverDtfsCardV26 } from '../shared/v26-cards'
import { V26_COUNTRY_GROUPS } from '../mock/v26-countries'

const V26Home = () => {
  const { t } = useLingui()
  return (
    <div className="container">
      <GridStage
        left={
          <AnimLeft
            anim={<EusdGlobe countryGroups={V26_COUNTRY_GROUPS} />}
            copy={<Trans>UGLYCASH is the Reserve App, and it’s on track to fuel huge growth in eUSD</Trans>}
            subcopy={null}
          />
        }
        cards={
          <>
            <HeldCardV18 smoothTicker />
            <VolumeCardV18 smoothTicker />
            <TransactionsCardV18 smoothTicker />
            <CountriesCardV26 />
            <UglyCashCardV18
              smoothTicker
              description={t`UGLYCASH is the Reserve App, and it’s on track to fuel huge growth in eUSD`}
            />
            <FintechCardV18 contactEmail="gabo@reserve.org" />
            <DiscoverDtfsCardV26 />
          </>
        }
      />
      <DataNote v26 className="mt-6 px-4 md:px-8" />
      <HomeFooter />
    </div>
  )
}

export default V26Home
