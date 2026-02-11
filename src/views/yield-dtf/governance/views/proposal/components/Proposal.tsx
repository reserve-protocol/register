import ProposalForm from './ProposalForm'
import ProposalOverview from './ProposalOverview'

const Proposal = () => (
  <div className="relative grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 p-1 sm:p-8 justify-center content-start items-start">
    <ProposalForm />
    <ProposalOverview />
  </div>
)

export default Proposal
