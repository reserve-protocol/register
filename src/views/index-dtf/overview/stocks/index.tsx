import useScrollToHash from '@/hooks/use-scroll-to-hash'
import { useIsLargeDesktop, useIsMobile } from '@/hooks/use-media-query'
import { Card } from '@/components/ui/card'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { isYieldIndexDTFAtom } from '@/state/dtf/yield-index-atoms'
import { useAtomValue } from 'jotai'
import useTrackIndexDTFPage from '../../hooks/useTrackIndexDTFPage'
import AboutReserveDtfs from './about-reserve-dtfs'
import BackedBadge from './backed-badge'
import StocksFaq from './faq'
import StocksVideoLibrary from './video-library'
import PriceChart from '../components/charts/price-chart'
import IndexCreatorNotes from '../components/index-creator-notes'
import IndexDisclousure from '../components/index-disclousure'
import IndexGovernanceOverview from '../components/index-governance-overview'
import IndexTransactionTable from '../components/index-transaction-table-with-swaps'
import StocksLandingMint from './landing-mint'
import { IndexBasketOverviewInner } from '../components/basket-overview'
import FeesStats from '../components/fees-stats'
import YieldIndexAbout from '../components/yield-index/yield-index-about'
import YieldIndexAssetExposure from '../components/yield-index/yield-index-asset-exposure'
import YieldIndexComposition from '../components/yield-index/yield-index-composition'

const AboutSection = () => {
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  // The trust cards also live in the xl-only rail — one copy per viewport.
  const isLargeDesktop = useIsLargeDesktop()
  const isMobile = useIsMobile()

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

  const aboutCard = !isLargeDesktop && (
    <div id="about" className="flex flex-col gap-0.5 sm:gap-1 xl:hidden">
      <StocksVideoLibrary />
      <StocksFaq />
      <AboutReserveDtfs />
    </div>
  )

  const basketCard = (
    <Card
      id="basket"
      className="group/section !bg-card pb-0 pt-0 sm:pb-0 sm:pt-0"
    >
      <BackedBadge />
      <IndexBasketOverviewInner progressive />
    </Card>
  )

  // Mobile keeps holdings reachable: only the videos lead, chat/About follow.
  if (isMobile) {
    return (
      <>
        <div id="about">
          <StocksVideoLibrary />
        </div>
        {basketCard}
        <StocksFaq />
        <AboutReserveDtfs />
        <FeesStats />
      </>
    )
  }

  return (
    <>
      {aboutCard}
      {basketCard}
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

const StocksIndexDTFOverview = () => {
  useTrackIndexDTFPage('overview')

  return (
    <div
      data-overview-variant="stocks"
      className="-mx-0 bg-secondary sm:mx-0 sm:bg-transparent"
    >
      <div className="mb-16 flex gap-1 bg-secondary px-0 pb-0 pt-0.5 sm:mb-0 sm:rounded-4xl sm:p-1">
        <Content />
        <StocksLandingMint />
      </div>
    </div>
  )
}

export default StocksIndexDTFOverview
