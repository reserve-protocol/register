import GovernanceActions from './components/GovernanceOverview'
import ProposalList from './components/ProposalList'
import TopVoters from './components/TopVoters'

const Governance = () => (
  <div className="container mx-auto px-2 md:px-0 py-4 pb-40">
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr] gap-4 lg:gap-8 items-start">
      <div>
        <ProposalList />
        <TopVoters className="mt-6 mb-0 lg:mb-6" />
      </div>
      <GovernanceActions />
    </div>
  </div>
)

export default Governance
