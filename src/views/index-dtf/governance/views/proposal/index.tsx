import ProposalDetailContent from './components/proposal-detail-content'
import ProposalDetailVotes from './components/proposal-detail-votes'
import ProposalDetailStats from './components/proposal-detail-stats'
import ProposalHeader from './components/proposal-header'
import ProposalVote from './components/proposal-vote'
import Updater from './updater'
import ProposalDetailTimeline from './components/proposal-detail-timeline'
import { Separator } from '@/components/ui/separator'

const Proposal = () => (
  <div className="container pr-2">
    <div className="bg-secondary rounded-3xl p-1 mb-2">
      <div className="grid grid-cols-1 lg:grid-cols-[10fr_5fr] gap-2 bg-card rounded-3xl">
        <ProposalHeader />
        <ProposalVote />
      </div>
      <Separator className="my-2 bg-white" />
      <div className="grid grid-cols-1 lg:grid-cols-[10fr_5fr] gap-2 rounded-3xl">
        <ProposalDetailContent />
        <div className="flex flex-col gap-2 border-l pl-2 border-white">
          <ProposalDetailStats />
          <ProposalDetailTimeline />
          <ProposalDetailVotes />
        </div>
      </div>
    </div>
    <Updater />
  </div>
)

export default Proposal
