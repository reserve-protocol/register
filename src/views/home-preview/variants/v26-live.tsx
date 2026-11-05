import { Trans } from '@lingui/react/macro'
import { AnimLeft } from '../shared/grid-left'
import { EusdGlobe } from '../shared/hero-anims'
import { mockData, UglycashDataProvider } from '../shared/uglycash-data'
import { useUglycashApi } from '../shared/use-uglycash-api'
import V18Page from '../shared/v18-page'
import { V26_COUNTRY_GROUPS } from '../mock/v26-countries'

const LOADING = { ...mockData, status: 'loading' as const }

const V26Live = () => {
  const { data, isError } = useUglycashApi()

  return (
    <UglycashDataProvider value={data ?? LOADING}>
      <V18Page
        v26
        cardShadow={false}
        sortTooltips
        dataState={isError && !data ? 'error' : 'ready'}
        left={
          <AnimLeft
            anim={<EusdGlobe countryGroups={V26_COUNTRY_GROUPS} />}
            copy={<Trans>Reserve is building a better version of money.</Trans>}
            subcopy={<Trans>UGLYCASH is the Reserve fintech app, and eUSD is its unit of account.</Trans>}
          />
        }
      />
    </UglycashDataProvider>
  )
}

export default V26Live
