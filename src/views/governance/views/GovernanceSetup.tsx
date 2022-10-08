import { t, Trans } from '@lingui/macro'
import { Container, InfoBox } from 'components'
import { SmallButton } from 'components/button'
import { useFormContext } from 'react-hook-form'
import { Box, Card, Grid, Text } from 'theme-ui'
import DeployHeader from '../../deploy/components/DeployHeader'
import DeploymentStepTracker, {
  Steps,
} from '../../deploy/components/DeployStep'
import GovernanceForm from '../components/GovernanceForm'

const GovernanceSetup = () => {
  const {
    formState: { isValid },
  } = useFormContext()

  return (
    <>
      <DeploymentStepTracker step={Steps.GovernanceSetup} />
      <Container mt={-4}>
        <DeployHeader
          isValid={isValid}
          title={t`Define Governance`}
          subtitle={t`Define account roles and governance configuration`}
          confirmText={t`Confirm governance setup`}
        />
        <Card p={0}>
          <Grid columns={2} gap={0}>
            <Box
              sx={{ borderRight: '1px solid', borderColor: 'border' }}
              my={5}
              px={5}
            >
              <GovernanceForm />
            </Box>
            <Box p={5}>
              <Text variant="strong" mb={2}>
                <Trans>What’s “standard governance”</Trans>
              </Text>
              <Text as="p" variant="legend" sx={{ fontSize: 2 }}>
                <Trans>
                  Please read our documentation on the matter to understand the
                  difference between setting your own ownership address and
                  using our custom build standard format.
                </Trans>
              </Text>
              <Box mt={3}>
                <SmallButton
                  variant="muted"
                  onClick={() =>
                    window.open('https://reserve.org/protocol/', '_blank')
                  }
                >
                  <Trans>Protocol docs</Trans>
                </SmallButton>
              </Box>
            </Box>
          </Grid>
        </Card>
      </Container>
    </>
  )
}

export default GovernanceSetup
