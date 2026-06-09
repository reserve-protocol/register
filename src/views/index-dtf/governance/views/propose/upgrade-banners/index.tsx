import ProposeV4Upgrade from './propose-v4-upgrade'
import ProposeV5UpgradeOptimistic from './propose-v5-optimistic-upgrade'
import ProposeV5Upgrade from './propose-v5-upgrade'

const UpgradeBanners = () => {

  return (
    <>
      <ProposeV4Upgrade />
      <ProposeV5Upgrade />
      <ProposeV5UpgradeOptimistic />
    </>
  )
}

export default UpgradeBanners