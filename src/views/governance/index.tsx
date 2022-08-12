import { t, Trans } from '@lingui/macro'
import { Container, InfoBox } from 'components'
import { Field, FormField } from 'components/field'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { accountRoleAtom } from 'state/atoms'
import { Box, Card, Grid, Select, Text } from 'theme-ui'
import { addressPattern, numberPattern } from 'utils'
import DeployHeader from '../deploy/components/DeployHeader'
import DeploymentStepTracker from '../deploy/components/DeployStep'

const defaultValues = {
  votingDelay: '5', // 5 blocks
  votingPeriod: '18000', // 100 blocks
  proposalThresholdAsMicroPercent: '1', // 1%
  quorumPercent: '4', // 4%
  minDelay: '24', // 24 hours -> 86400
  freezer: '',
  pauser: '',
  owner: '',
}

const Governance = () => {
  const form = useForm({
    mode: 'onChange',
    defaultValues,
  })
  const accountRole = useAtomValue(accountRoleAtom)
  const navigate = useNavigate()
  const [unfreeze, setUnfreeze] = useState(0)

  useEffect(() => {
    if (!accountRole.owner) {
      navigate('/')
    }
  }, [accountRole])

  const handleBack = () => {}

  const handleConfirm = () => {}

  const handleFreezeStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUnfreeze(+e.currentTarget.value)
  }

  return (
    <FormProvider {...form}>
      <DeploymentStepTracker step={6} />
      <Container>
        <DeployHeader
          onBack={handleBack}
          onConfirm={handleConfirm}
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
              <Text variant="title" mb={4}>
                <Trans>Permissions</Trans>
              </Text>
              <FormField
                label={t`Freezer address`}
                placeholder={t`Input freezer ethereum address`}
                mb={3}
                name="freezer"
                options={{
                  required: true,
                  pattern: {
                    value: addressPattern,
                    message: t`Invalid ethereum address`,
                  },
                }}
              />
              <FormField
                label={t`Pauser address`}
                placeholder={t`Input pauser ethereum address`}
                mb={4}
                name="pauser"
                options={{
                  required: true,
                  pattern: {
                    value: addressPattern,
                    message: t`Invalid ethereum address`,
                  },
                }}
              />
              <Text variant="title" mb={4}>
                <Trans>RToken state after transaction</Trans>
              </Text>
              <Field label={t`Freeze status`} mb={4}>
                <Select defaultValue={unfreeze} onChange={handleFreezeStatus}>
                  <option value={0}>
                    <Trans>RToken will be left in freeze state</Trans>
                  </option>
                  <option value={1}>
                    <Trans>RToken will be fully functional</Trans>
                  </option>
                </Select>
                {!unfreeze && (
                  <Text
                    sx={{ color: 'warning', display: 'block', fontSize: 1 }}
                    mt={1}
                    ml={1}
                  >
                    <Trans>
                      Only the unfreezer address will be able to unfreeze
                    </Trans>
                  </Text>
                )}
              </Field>
              <Text variant="title" mb={4}>
                <Trans>Governance parameters</Trans>
              </Text>
              <FormField
                label={t`Voting delay (blocks)`}
                placeholder={t`Input number of blocks`}
                mb={3}
                name="votingDelay"
                options={{
                  required: true,
                  pattern: numberPattern,
                  min: 1,
                  max: 80640,
                }}
              />
              <FormField
                label={t`Voting period (blocks)`}
                placeholder={t`Input number of blocks`}
                mb={4}
                name="votingPeriod"
                options={{
                  required: true,
                  pattern: numberPattern,
                  min: 18000,
                  max: 80640,
                }}
              />
              <FormField
                label={t`proposalThreshold (%)`}
                placeholder={t`Input proposal threshold`}
                mb={3}
                name="proposalThresholdAsMicroPercent"
                options={{
                  required: true,
                  pattern: numberPattern,
                  min: 0,
                  max: 5,
                }}
              />
              <FormField
                label={t`Quorum (%)`}
                placeholder={t`Input quorum percent`}
                mb={4}
                name="quorumPercent"
                options={{
                  required: true,
                  pattern: numberPattern,
                  min: 0,
                  max: 50,
                }}
              />
              <FormField
                label={t`Minimum delay (hours)`}
                placeholder={t`Input Minimum delay in hours`}
                mb={3}
                name="minDelay"
                options={{
                  required: true,
                  pattern: numberPattern,
                  min: 1,
                  max: 336,
                }}
              />
            </Box>
            <Box p={4}>
              <InfoBox title="Something something" subtitle="sd" />
              <InfoBox mt={3} title="Something something" subtitle="sd" />
            </Box>
          </Grid>
        </Card>
      </Container>
    </FormProvider>
  )
}

export default Governance
