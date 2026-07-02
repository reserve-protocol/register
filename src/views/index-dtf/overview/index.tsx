import useScrollToHash from '@/hooks/use-scroll-to-hash'
import { useIsLargeDesktop } from '@/hooks/use-media-query'
import { Card } from '@/components/ui/card'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { isYieldIndexDTFAtom } from '@/state/dtf/yield-index-atoms'
import { useAtomValue } from 'jotai'
import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import PriceChart from './components/charts/price-chart'
import IndexAboutOverview from './components/index-about-overview'
import IndexCreatorNotes from './components/index-creator-notes'
import IndexDisclousure from './components/index-disclousure'
import IndexGovernanceOverview from './components/index-governance-overview'
import IndexTransactionTable from './components/index-transaction-table'
import LandingMint from './components/landing-mint'
import { IndexBasketOverviewInner } from './components/basket-overview'
import FeesStats from './components/fees-stats'
import YieldIndexAbout from './components/yield-index/yield-index-about'
import YieldIndexAssetExposure from './components/yield-index/yield-index-asset-exposure'
import YieldIndexComposition from './components/yield-index/yield-index-composition'

const AboutSection = () => {
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  // WHY: the about card (autoplaying cover video) also lives in the xl-only
  // LandingMint rail — mount only one copy so the video isn't fetched and
  // played twice; the xl:hidden class stays as a resize-timing backstop.
  const isLargeDesktop = useIsLargeDesktop()

  if (isYieldIndexDTF) {
    return (
      <>
        <Card id="about" className="group/section">
          <YieldIndexAbout />
          <div className="mx-4 sm:mx-6 border-t border-secondary" />
          <YieldIndexAssetExposure />
        </Card>
        <FeesStats />
        <YieldIndexComposition />
      </>
    )
  }

  return (
    <>
      {!isLargeDesktop && (
        <Card
          id="about"
          className="group/section pb-0 pt-0 sm:pb-0 sm:pt-0 xl:hidden"
        >
          <IndexAboutOverview className="xl:hidden" showCover />
        </Card>
      )}
      <Card
        id="basket"
        className="group/section !bg-card pb-0 pt-0 sm:pb-0 sm:pt-0"
      >
        <IndexBasketOverviewInner />
      </Card>
      <FeesStats />
    </>
  )
}

const Content = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  useScrollToHash()

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-col gap-0.5 sm:gap-1">
        <PriceChart />
        <AboutSection />
        {!!indexDTF?.stToken && <IndexGovernanceOverview />}
        <IndexCreatorNotes />
        <IndexTransactionTable />
        <IndexDisclousure />
      </div>
    </div>
  )
}

const IndexDTFOverview = () => {
  useTrackIndexDTFPage('overview')
  return (
    <div className="-mx-0 bg-secondary sm:mx-0 sm:bg-transparent">
      <div className="mb-16 flex gap-1 bg-secondary px-0 pb-0 pt-0.5 sm:mb-0 sm:rounded-4xl sm:p-1">
        <Content />
        <LandingMint />
      </div>
    </div>
  )
}

export default IndexDTFOverview
