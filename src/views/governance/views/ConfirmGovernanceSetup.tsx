import { t } from '@lingui/macro'
import { Container } from 'components'
import { Box, Grid } from 'theme-ui'
import { v4 as uuid } from 'uuid'
import DeployHeader from 'views/deploy/components/DeployHeader'
import DeploymentStepTracker, {
  Steps,
} from 'views/deploy/components/DeployStep'
import GovernanceSummary from '../components/GovernanceSummary'

const ConfirmGovernanceSetup = () => {
  return (
    <>
      <DeploymentStepTracker step={Steps.GovernanceSummary} />
      <Container mt={-4}>
        <DeployHeader
          title={t`Governance Summary`}
          subtitle={t`Lorem ipsum dolor sit amet, consectetur adipiscing elit.`}
          confirmText={t`Confirm Setup`}
        />
        <GovernanceSummary />
      </Container>
    </>
  )
}

export default ConfirmGovernanceSetup
