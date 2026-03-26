import useScrollToHash from '@/hooks/use-scroll-to-hash'
import { indexDTFAtom, isYieldIndexDTFAtom } from '@/state/dtf/atoms'
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
import { ZAPPER_API } from '@/utils/constants'
import LandingMint from './components/landing-mint'
import IndexBasketOverview from './components/basket-overview'
import FeesStats from './components/fees-stats'
import YieldIndexAbout from './components/yield-index/yield-index-about'
import YieldIndexAssetExposure from './components/yield-index/yield-index-asset-exposure'
import YieldIndexComposition from './components/yield-index/yield-index-composition'

const Content = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const quoteSource = useAtomValue(indexDTFQuoteSourceAtom)
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  useScrollToHash()

  return (
    <div className="rounded-0xl lg:rounded-4xl bg-secondary flex-1 lg:mb-4">
      <PriceChart />
      <div className="flex flex-col gap-1 m-1 -mt-[60px] sm:-mt-20">
        {isYieldIndexDTF ? (
          <>
            <YieldIndexAbout />
            <YieldIndexAssetExposure />
            <FeesStats />
            <YieldIndexComposition />
          </>
        ) : (
          <>
            <IndexAboutOverview />
            <IndexBasketOverview />
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
            apiUrl={ZAPPER_API}
            defaultSource={quoteSource}
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
