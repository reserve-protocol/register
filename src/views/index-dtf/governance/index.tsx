import GovernanceProposalList from './components/governance-proposal-list'

const GovernanceStats = () => {
  return <div>stats</div>
}

const IndexDTFGovernance = () => {
  return (
    <div className="grid grid-cols-[1.5fr_1fr] gap-2 pr-2 pb-6">
      <GovernanceProposalList />
      <GovernanceStats />
    </div>
  )
}

export default IndexDTFGovernance
