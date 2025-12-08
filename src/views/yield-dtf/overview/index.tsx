import SectionContainer from '@/components/section-navigation/section-container'
import SectionWrapper from '@/components/section-navigation/section-wrapper'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect } from 'react'
import { selectedRTokenAtom } from 'state/atoms'
import Backing from './components/backing'
import Hero from './components/hero'
import HistoricalMetrics from './components/historical-metrics'
import RTokenEarn from './components/rtoken-earn'
import RTokenTransactions from './components/rtoken-transactions'

// Move state management of tracking on an separate component to avoid re-renders
const Tracking = () => {
  const rToken = useAtomValue(selectedRTokenAtom)

  useEffect(() => {
    if (rToken) {
      mixpanel.track('Visted RToken Overview', {
        RToken: rToken?.toLowerCase(),
      })
    }
  }, [rToken])

  return null
}

const SectionDivider = () => (
  <hr className="-mx-1 sm:-mx-4 2xl:-mx-10 my-4 sm:my-8 border-border" />
)

/**
 * RToken Overview *
 */
const Overview = () => (
  <SectionContainer className="w-full p-1 md:p-4">
    <SectionWrapper navigationIndex={0}>
      <Hero />
    </SectionWrapper>
    <SectionDivider />
    <SectionWrapper navigationIndex={1}>
      <Backing />
    </SectionWrapper>
    <SectionDivider />
    <SectionWrapper navigationIndex={2}>
      <RTokenEarn />
    </SectionWrapper>
    <SectionDivider />
    <SectionWrapper navigationIndex={3}>
      <HistoricalMetrics />
    </SectionWrapper>
    <SectionDivider />
    <SectionWrapper navigationIndex={4}>
      <RTokenTransactions />
    </SectionWrapper>
    <Tracking />
  </SectionContainer>
)

export default Overview
