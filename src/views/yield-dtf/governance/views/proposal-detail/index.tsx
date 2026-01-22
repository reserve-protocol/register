import ProposalTimeline from './components/proposal-timeline/index'
import ProposalDetailContent from './components/ProposalDetailContent'
import ProposalDetailStats from './components/ProposalDetailStats'
import ProposalVotes from './components/ProposalVotes'
import ProposalHeader from './ProposalHeader'
import ProposalDetailAtomUpdater from './ProposalDetailAtomUpdater'
import ProposalVote from './components/ProposalVote'

const GovernanceProposalDetail = () => (
  <div className="m-1 rounded-[14px] bg-secondary p-1 sm:m-6">
    <ProposalDetailAtomUpdater />
    <div className="grid grid-cols-1 gap-2 rounded-[14px] bg-card px-1 sm:px-2 lg:grid-cols-[10fr_5fr] [align-content:flex-start] [align-items:flex-start]">
      <ProposalHeader />
      <div className="h-full py-1 sm:py-2">
        <ProposalVote />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-2 bg-secondary px-1 py-3 sm:px-2 lg:grid-cols-[10fr_5fr] [align-content:flex-start] [align-items:flex-start]">
      <ProposalDetailContent />
      <div>
        <ProposalDetailStats />
        <ProposalTimeline />
        <ProposalVotes />
      </div>
    </div>
  </div>
)

export default GovernanceProposalDetail
