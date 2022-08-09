import { t } from '@lingui/macro'
import DeployHeader from '../components/DeployHeader'
import DeployIntro from '../components/DeployIntro'

const Intro = () => (
  <>
    <DeployHeader
      title={t`Intro to RToken Deployment`}
      subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      confirmText={t`Start`}
    />
    <DeployIntro />
  </>
)

export default Intro
