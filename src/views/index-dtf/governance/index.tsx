import GovernanceDelegateList from './components/governance-delegate-list'
import GovernanceProposalList from './components/governance-proposal-list'
import GovernanceStats from './components/governance-stats'
import Updater from './updater'

const IndexDTFGovernance = () => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-2 pr-2 pb-6">
        <div className="flex flex-col gap-2">
          <GovernanceProposalList />
          <GovernanceDelegateList />
        </div>
        <div className="flex flex-col gap-2">
          <GovernanceStats />
        </div>
      </div>
      {/* <Updater /> */}
    </>
  )
}

export default IndexDTFGovernance
