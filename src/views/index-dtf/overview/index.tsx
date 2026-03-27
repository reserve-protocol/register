import { isInactiveDTF } from '@/hooks/use-dtf-status'
import useScrollToHash from '@/hooks/use-scroll-to-hash'
import { Card } from '@/components/ui/card'
import {
  indexDTFAtom,
  isYieldIndexDTFAtom,
  indexDTFStatusAtom,
} from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import PriceChart from './components/charts/price-chart'
import IndexAboutOverview from './components/index-about-overview'
import IndexCreatorNotes from './components/index-creator-notes'
import IndexDisclousure from './components/index-disclousure'
import IndexGovernanceOverview from './components/index-governance-overview'
import IndexTransactionTable from './components/index-transaction-table'
import ZapperWrapper from '../components/zapper/zapper-wrapper'
import { wagmiConfig } from '@/state/chain'
import { indexDTFQuoteSourceAtom } from '../issuance'
import { RESERVE_API, ZAPPER_API } from '@/utils/constants'
import LandingMint from './components/landing-mint'
import { IndexBasketOverviewInner } from './components/basket-overview'
import FeesStats from './components/fees-stats'
import YieldIndexAbout from './components/yield-index/yield-index-about'
import YieldIndexAssetExposure from './components/yield-index/yield-index-asset-exposure'
import YieldIndexComposition from './components/yield-index/yield-index-composition'

const Content = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const quoteSource = useAtomValue(indexDTFQuoteSourceAtom)
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  const isDeprecated = isInactiveDTF(useAtomValue(indexDTFStatusAtom))
  useScrollToHash()

  return (
    <div className="rounded-0xl lg:rounded-4xl bg-secondary flex-1 lg:mb-4">
      <PriceChart />
      <div className="flex flex-col gap-1 m-1 -mt-[60px] sm:-mt-20">
        {isYieldIndexDTF ? (
          <>
            <Card id="about" className="group/section">
              <YieldIndexAbout />
              <div className="mx-4 sm:mx-6 border-t border-secondary" />
              <YieldIndexAssetExposure />
            </Card>
            <FeesStats />
            <YieldIndexComposition />
          </>
        ) : (
          <>
            <Card
              id="about"
              className="group/section pt-0 sm:pt-0 pb-5 sm:pb-6"
            >
              <IndexAboutOverview />
              <div className="px-4 sm:px-6">
                <IndexBasketOverviewInner />
              </div>
            </Card>
            <FeesStats />
          </>
        )}
        {!!indexDTF?.stToken && <IndexGovernanceOverview />}
        <IndexCreatorNotes />
        <IndexTransactionTable />
        <IndexDisclousure />
        {indexDTF && (
          <ZapperWrapper
            wagmiConfig={wagmiConfig}
            chain={indexDTF.chainId}
            dtfAddress={indexDTF.id}
            mode="modal"
            apiUrl={RESERVE_API}
            zapperApiUrl={ZAPPER_API}
            defaultSource={quoteSource}
            sellOnly={isDeprecated}
          />
        )}
      </div>
    </div>
  )
}

const IndexDTFOverview = () => {
  useTrackIndexDTFPage('overview')
  return (
    <div className="flex gap-2">
      <Content />
      <LandingMint />
    </div>
  )
}

export default IndexDTFOverview
