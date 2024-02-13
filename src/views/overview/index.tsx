import SectionContainer from 'components/section-navigation/SectionContainer'
import SectionWrapper from 'components/section-navigation/SectionWrapper'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useEffect } from 'react'
import { selectedRTokenAtom } from 'state/atoms'
import { Divider } from 'theme-ui'
import Hero from './components/hero'
import RTokenEarn from './components/RTokenEarn'
import RTokenTransactions from './components/RTokenTransactions'
import Backing from './components/backing'

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

/**
 * RToken Overview *
 */
const Overview = () => (
  <SectionContainer variant="layout.tokenView">
    <SectionWrapper navigationIndex={0}>
      <Hero />
    </SectionWrapper>
    <Divider variant="layout.sectionDivider" />
    <SectionWrapper navigationIndex={1}>
      <Backing />
    </SectionWrapper>
    <Divider variant="layout.sectionDivider" />
    <SectionWrapper navigationIndex={2}>
      <RTokenEarn />
    </SectionWrapper>
    <Divider variant="layout.sectionDivider" />
    <SectionWrapper navigationIndex={3}>
      <RTokenTransactions />
    </SectionWrapper>
    <Tracking />
  </SectionContainer>
)

export default Overview
