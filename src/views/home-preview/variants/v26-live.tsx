import { Trans } from '@lingui/react/macro'
import { AnimLeft } from '../shared/grid-left'
import { EusdGlobe } from '../shared/hero-anims'
import { mockData, UglycashDataProvider } from '../shared/uglycash-data'
import { useUglycashApi } from '../shared/use-uglycash-api'
import V18Page from '../shared/v18-page'
import { V26_COUNTRY_GROUPS } from '../mock/v26-countries'

const LOADING = { ...mockData, status: 'loading' as const }

const V26Live = ({ v27 = false }: { v27?: boolean }) => {
  const { data, isError } = useUglycashApi()

  return (
    <UglycashDataProvider value={data ?? LOADING}>
      <V18Page
        v26
        v27={v27}
        cardShadow={false}
        sortTooltips
        dataState={isError && !data ? 'error' : 'ready'}
        left={
          <AnimLeft
            anim={<EusdGlobe countryGroups={V26_COUNTRY_GROUPS} smoothArcs={v27} />}
            copy={v27 ? (
              <Trans>Spotlight: eUSD lets fintechs monetize their balances and offer GENIUS-compatible yield or rewards to their users</Trans>
            ) : <Trans>Reserve is building a better version of money.</Trans>}
            subcopy={v27 ? (
              <Trans>Reserve is building better versions of money, to help you hold and protect your share of the world’s wealth.</Trans>
            ) : <Trans>UGLYCASH is the Reserve fintech app, and eUSD is its unit of account.</Trans>}
          />
        }
      />
    </UglycashDataProvider>
  )
}

export const V27Live = () => <V26Live v27 />

export default V26Live
