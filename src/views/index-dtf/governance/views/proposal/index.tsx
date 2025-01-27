import ProposalHeader from './components/proposal-header'
import ProposalVote from './components/proposal-vote'
import Updater from './updater'

const Proposal = () => {
  return (
    <>
      <div className="container bg-secondary rounded-3xl p-1 mr-2 mb-2">
        <div className="grid grid-cols-1 lg:grid-cols-[10fr_5fr] gap-2 bg-card rounded-3xl">
          <ProposalHeader />
          <ProposalVote />
        </div>
      </div>
      <Updater />
    </>
  )
}

export default Proposal
