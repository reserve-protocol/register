import ProposeFolioGovernanceUpgrade from './propose-folio-governance-upgrade'
import ProposeV4Upgrade from './propose-v4-upgrade'
import ProposeOptimisticGovernanceUpgrade from './propose-optimistic-governance-upgrade'
import ProposeRetireVoteLock from './propose-retire-vote-lock'
import ProposeV5Upgrade from './propose-v5-upgrade'
import ProposeVoteLockUpgrade from './propose-vote-lock-upgrade'

const UpgradeBanners = () => {
  return (
    <>
      <ProposeV4Upgrade />
      <ProposeV5Upgrade />
      <ProposeVoteLockUpgrade />
      <ProposeFolioGovernanceUpgrade />
      <ProposeOptimisticGovernanceUpgrade />
      <ProposeRetireVoteLock />
    </>
  )
}

export default UpgradeBanners
