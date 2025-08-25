import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import GovernanceDelegateList from './components/governance-delegate-list'
import GovernanceGuardians from './components/governance-guardians'
import GovernanceProposalList from './components/governance-proposal-list'
import GovernanceStats from './components/governance-stats'
import GovernanceVoteLock from './components/governance-vote-lock'

// Updater lives in the main container!
const IndexDTFGovernance = () => {
  useTrackIndexDTFPage('governance')
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-2 lg:pr-2 lg:pb-4">
      <GovernanceProposalList />
      <div className="flex flex-col gap-1 p-1 bg-muted rounded-4xl h-fit">
        <GovernanceVoteLock />
        <GovernanceStats />
        <GovernanceGuardians />
        <GovernanceDelegateList />
      </div>
    </div>
  )
}

export default IndexDTFGovernance
