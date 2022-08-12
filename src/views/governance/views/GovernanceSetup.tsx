import { t, Trans } from '@lingui/macro'
import { Container, InfoBox } from 'components'
import { Field, FormField } from 'components/field'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { accountRoleAtom } from 'state/atoms'
import { Box, Card, Flex, Grid, Select, Switch, Text } from 'theme-ui'
import { addressPattern, numberPattern } from 'utils'
import { ROUTES } from 'utils/constants'
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
          title={t`Configure Governance`}
          subtitle={t`Lorem ipsum dolor sit amet, consectetur adipiscing elit.`}
          confirmText={t`Confirm Config`}
        />
        <Card p={0}>
          <Grid columns={2} gap={0}>
            <Box
              sx={{ borderRight: '1px solid', borderColor: 'border' }}
              my={4}
              px={4}
            >
              <GovernanceForm />
            </Box>
            <Box p={4}>
              <InfoBox title="Something something" subtitle="sd" />
              <InfoBox mt={3} title="Something something" subtitle="sd" />
            </Box>
          </Grid>
        </Card>
      </Container>
    </>
  )
}

export default GovernanceSetup
