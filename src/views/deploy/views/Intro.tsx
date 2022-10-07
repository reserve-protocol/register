import { t } from '@lingui/macro'
import DeployHeader from '../components/DeployHeader'
import DeployIntro from '../components/DeployIntro'

const Intro = () => (
  <>
    <DeployHeader
      title={t`Deploy your RToken`}
      subtitle="First configure your RToken collateral basket parameters, then in second transaction, set up governance."
      confirmText={t`Start`}
    />
    <DeployIntro />
  </>
)

export default Intro
