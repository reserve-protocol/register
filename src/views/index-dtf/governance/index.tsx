import DtfVoteLockMigration, {
  useDtfVoteLockMigration,
} from '../components/vote-lock-migration'
import UpcomingVoteLock from '../components/vote-lock-migration/upcoming-vote-lock'
import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import GovernanceAccountInfo from './components/governance-account-info'
import GovernanceDelegateList from './components/governance-delegate-list'
import GovernanceProposalList from './components/governance-proposal-list'
import GovernanceRoles from './components/governance-roles'
import GovernanceStats from './components/governance-stats'
import GovernanceVoteLock from './components/governance-vote-lock'

// Updater lives in the main container!
const IndexDTFGovernance = () => {
  useTrackIndexDTFPage('governance')
  const { isActive: isMigrating } = useDtfVoteLockMigration()
  return (
    <div
      data-testid="dtf-governance"
      className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-2 lg:pr-2 lg:pb-4"
    >
      <div className="min-w-0 lg:order-1">
        <GovernanceProposalList />
      </div>
      <div className="flex flex-col gap-1 p-1 bg-muted rounded-4xl h-fit order-first lg:order-2">
        <DtfVoteLockMigration page="governance" allowConnectPrompt />
        <UpcomingVoteLock page="governance" />
        {!isMigrating && <GovernanceVoteLock />}
        <GovernanceAccountInfo />
        <GovernanceStats />
        <GovernanceRoles />
        <GovernanceDelegateList />
      </div>
    </div>
  )
}

export default IndexDTFGovernance
