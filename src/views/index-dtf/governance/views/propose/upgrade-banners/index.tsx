import ProposeV4Upgrade from './propose-v4-upgrade'
import ProposeOptimisticGovernanceUpgrade from './propose-optimistic-governance-upgrade'
import ProposeRetireVoteLock from './propose-retire-vote-lock'
import ProposeV5Upgrade from './propose-v5-upgrade'
import ProposeV6Upgrade from './propose-v6-upgrade'

const UpgradeBanners = () => {
  return (
    <>
      <ProposeV4Upgrade />
      <ProposeV5Upgrade />
      <ProposeV6Upgrade />
      <ProposeOptimisticGovernanceUpgrade />
      <ProposeRetireVoteLock />
    </>
  )
}

export default UpgradeBanners