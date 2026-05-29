import { Separator } from '@/components/ui/separator'
import ProposalDetailContent from './components/proposal-detail-content'
import ProposalDetailStats from './components/proposal-detail-stats'
import ProposalDetailTimeline from './components/proposal-detail-timeline'
import ProposalDetailVotes from './components/proposal-detail-votes'
import ProposalHeader from './components/proposal-header'
import ProposalVote from './components/proposal-vote'
import Updater from './updater'

const Header = () => (
  <div className="grid grid-cols-1 lg:grid-cols-[10fr_5fr] gap-2 bg-card rounded-3xl mb-1 lg:mb-0">
    <ProposalHeader />
    <ProposalVote />
  </div>
)

const Overview = () => (
  <div className="flex flex-col gap-1 lg:gap-2 lg:border-l lg:pl-2 border-background">
    <ProposalDetailStats />
    <ProposalDetailTimeline />
    <ProposalDetailVotes />
  </div>
)

const Body = () => (
  <div className="grid grid-cols-1 lg:grid-cols-[10fr_5fr] lg:gap-2 gap-1 rounded-3xl">
    <ProposalDetailContent />
    <Overview />
  </div>
)

const Proposal = () => (
  <div className="container lg:pr-2">
    <div className="bg-secondary rounded-3xl p-1 lg:mb-2">
      <Header />
      <Separator className="my-2 bg-background hidden lg:block" />
      <Body />
    </div>
    <Updater />
  </div>
)

export default Proposal
