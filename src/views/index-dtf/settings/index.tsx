import useTrackIndexDTFPage from '../hooks/useTrackIndexDTFPage'
import DistributeFees from './components/distribute-fees'
import BasicInfo from './components/index-settings-basic'
import FeesInfo from './components/index-settings-fees'
import GovernanceInfo from './components/index-settings-governance'
import GovernanceTokenInfo from './components/index-settings-governance-token'
import RolesInfo from './components/index-settings-roles'

const IndexDTFSettings = () => {
  useTrackIndexDTFPage('settings')
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-2 lg:pr-2 lg:pb-4">
      <div className="flex flex-col gap-2">
        <BasicInfo />
        <GovernanceTokenInfo />
        <FeesInfo />
        <GovernanceInfo basket />
        <GovernanceInfo />
      </div>
      <div className="flex flex-col gap-2">
        <RolesInfo />
        <DistributeFees />
      </div>
    </div>
  )
}

export default IndexDTFSettings
