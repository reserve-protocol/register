import { useAtomValue } from 'jotai'
import IndexAboutOverview from './components/index-about-overview'
import IndexDisclousure from './components/index-disclousure'
import IndexGovernanceOverview from './components/index-governance-overview'
import IndexTokenOverview from './components/index-token-overview'
import LandingMint from './components/landing-mint'
import PriceChart from './components/price-chart'
import { indexDTFAtom } from '@/state/dtf/atoms'
import IndexCreatorNotes from './components/index-creator-notes'

const Content = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  return (
    <div className="rounded-2xl bg-secondary flex-1 mb-4">
      <PriceChart />
      <div className="flex flex-col gap-1 m-1 -mt-20">
        <IndexTokenOverview />
        {/* <IndexAboutOverview /> */}
        {!!indexDTF?.stToken && <IndexGovernanceOverview />}
        <IndexCreatorNotes />
        <IndexDisclousure />
      </div>
    </div>
  )
}

const IndexDTFOverview = () => {
  return (
    <div className="flex gap-2">
      <Content />
      <LandingMint />
    </div>
  )
}

export default IndexDTFOverview
