import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import IndexAboutOverview from './components/index-about-overview'
import IndexCreatorNotes from './components/index-creator-notes'
import IndexDisclousure from './components/index-disclousure'
import IndexGovernanceOverview from './components/index-governance-overview'
import IndexTokenOverview from './components/index-token-overview'
import LandingMint from './components/landing-mint'
import PriceChart from './components/price-chart'
import IndexTransactionTable from './components/index-transaction-table'
import IndexCampaignOverview from './components/index-campaign-overview'

const Content = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  return (
    <div className="rounded-2xl bg-secondary flex-1 lg:mb-4">
      <PriceChart />
      <div className="flex flex-col gap-1 m-1 -mt-20">
        <IndexTokenOverview />
        <IndexAboutOverview />
        <IndexCampaignOverview />
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
    <div className="flex gap-2">
      <Content />
      <LandingMint />
    </div>
  )
}

export default IndexDTFOverview
