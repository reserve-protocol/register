import useScrollToHash from '@/hooks/use-scroll-to-hash'
import { useIsLargeDesktop, useIsMobile } from '@/hooks/use-media-query'
import { Card } from '@/components/ui/card'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { isYieldIndexDTFAtom } from '@/state/dtf/yield-index-atoms'
import { useAtomValue } from 'jotai'
import useTrackIndexDTFPage from '../../hooks/useTrackIndexDTFPage'
import AboutReserveDtfs from './about-reserve-dtfs'
import OndoBackedBadge from './ondo-backed-badge'
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
  // WHY: the trust cards (video library, AI chat, About Reserve) also live in
  // the xl-only LandingMint rail — mount only one copy per viewport, keyed on
  // the same useIsLargeDesktop hook the rail uses.
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

  // Below xl the rail is hidden, so the trust cards render in the page flow
  // instead — replacing the legacy About card (old About copy + autoplaying
  // cover video), which the stocks layout drops entirely.
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
      <OndoBackedBadge />
      <IndexBasketOverviewInner progressive />
    </Card>
  )

  // Mobile: the About card leads (below the chart, above holdings); the
  // heavier chat and About Reserve cards follow the table so it stays
  // reachable. Tablet keeps the full trust stack ahead of holdings.
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
