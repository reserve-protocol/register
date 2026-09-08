import useScrollToHash from '@/hooks/use-scroll-to-hash'
import { useIsLargeDesktop, useIsMobile } from '@/hooks/use-media-query'
import { Card } from '@/components/ui/card'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { isYieldIndexDTFAtom } from '@/state/dtf/yield-index-atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import AboutDTF, { useHasVideoLibrary } from './components/about-dtf'
import AboutReserve from './components/about-reserve'
import AskReserveAI from './components/ask-reserve-ai'
import BackedBadge from './components/backed-badge'
import { IndexBasketOverviewInner } from './components/basket-overview'
import PriceChart from './components/charts/price-chart'
import FeesStats from './components/fees-stats'
import IndexCreatorNotes from './components/index-creator-notes'
import IndexDisclousure from './components/index-disclousure'
import IndexGovernanceOverview from './components/index-governance-overview'
import IndexTransactionTable from './components/index-transaction-table-with-swaps'
import LandingMint from './components/landing-mint'
import { watchedCoverDtfAtom } from './components/landing-mint/dtf-cover'
import YieldIndexAbout from './components/yield-index/yield-index-about'
import YieldIndexAssetExposure from './components/yield-index/yield-index-asset-exposure'
import YieldIndexComposition from './components/yield-index/yield-index-composition'

const AboutSection = () => {
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)
  // The about/chat/reserve cards also live in the xl-only rail — one copy per viewport.
  const isLargeDesktop = useIsLargeDesktop()
  const isMobile = useIsMobile()
  const hasVideoLibrary = useHasVideoLibrary()

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

  const basketCard = (
    <Card
      id="basket"
      className="group/section !bg-card pb-0 pt-0 sm:pb-0 sm:pt-0"
    >
      <BackedBadge />
      <IndexBasketOverviewInner progressive />
    </Card>
  )

  // Mobile keeps holdings reachable: only the compact video library leads,
  // a text description follows the basket.
  if (isMobile) {
    const aboutCard = (
      <div id="about">
        <AboutDTF showCover />
      </div>
    )

    return (
      <>
        {hasVideoLibrary ? aboutCard : basketCard}
        {hasVideoLibrary ? basketCard : aboutCard}
        <AskReserveAI />
        <AboutReserve />
        <FeesStats />
      </>
    )
  }

  return (
    <>
      {!isLargeDesktop && (
        <div id="about" className="flex flex-col gap-0.5 sm:gap-1 xl:hidden">
          <AboutDTF showCover />
          <AskReserveAI />
          <AboutReserve />
        </div>
      )}
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

const IndexDTFOverview = () => {
  useTrackIndexDTFPage('overview')
  const setWatchedCoverDtf = useSetAtom(watchedCoverDtfAtom)

  // Leaving the overview resets the frozen cover so a fresh visit loops again.
  useEffect(() => () => setWatchedCoverDtf(null), [setWatchedCoverDtf])

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
