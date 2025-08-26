import ProposalDetailContent from './components/proposal-detail-content'
import ProposalDetailVotes from './components/proposal-detail-votes'
import ProposalDetailStats from './components/proposal-detail-stats'
import ProposalHeader from './components/proposal-header'
import ProposalVote from './components/proposal-vote'
import Updater from './updater'
import ProposalDetailTimeline from './components/proposal-detail-timeline'
import { Separator } from '@/components/ui/separator'

const Proposal = () => (
  <div className="container lg:pr-2">
    <div className="bg-secondary rounded-3xl p-1 lg:mb-2">
      <div className="grid grid-cols-1 lg:grid-cols-[10fr_5fr] gap-2 bg-card rounded-3xl mb-1 lg:mb-0">
        <ProposalHeader />
        <ProposalVote />
      </div>
      <Separator className="my-2 bg-background hidden lg:block" />
      <div className="grid grid-cols-1 lg:grid-cols-[10fr_5fr] lg:gap-2 gap-1 rounded-3xl">
        <div className="overflow-auto">
          <ProposalDetailContent />
        </div>
        <div className="flex flex-col gap-1 lg:gap-2 lg:border-l lg:pl-2 border-background">
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
