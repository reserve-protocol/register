import ProposeV4Upgrade from './propose-v4-upgrade'
import ProposeOptimisticGovernanceUpgrade from './propose-optimistic-governance-upgrade'
import ProposeRetireVoteLock from './propose-retire-vote-lock'
import ProposeV5Upgrade from './propose-v5-upgrade'

const UpgradeBanners = () => {
  return (
    <>
      <ProposeV4Upgrade />
      <ProposeV5Upgrade />
      <ProposeOptimisticGovernanceUpgrade />
      <ProposeRetireVoteLock />
    </>
  )
}

export default UpgradeBanners