import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import PriceChart from './components/charts/price-chart'
import IndexAboutOverview from './components/index-about-overview'
import IndexBasketOverview from './components/index-basket-overview'
import IndexCreatorNotes from './components/index-creator-notes'
import IndexDisclousure from './components/index-disclousure'
import IndexGovernanceOverview from './components/index-governance-overview'
import IndexTransactionTable from './components/index-transaction-table'
import LandingMint from './components/landing-mint'

const Content = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  return (
    <div className="rounded-0xl lg:rounded-4xl bg-secondary flex-1 lg:mb-4">
      <PriceChart />
      <div className="flex flex-col gap-1 m-1 -mt-20">
        <IndexBasketOverview />
        <IndexAboutOverview />
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
