import { t, Trans } from '@lingui/macro'
import { FormField } from 'components/field'
import { Box, BoxProps, Text } from 'theme-ui'
import { numberPattern } from 'utils'

const GovernanceParameters = (props: BoxProps) => {
  return (
    <Box {...props}>
      <Text variant="title" mb={4} px={2}>
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
          min: 300,
          max: 80640,
        }}
      />
      <FormField
        label={t`Proposal execution delay (hours)`}
        placeholder={t`Input delay in hours`}
        mb={3}
        name="minDelay"
        options={{
          required: true,
          pattern: numberPattern,
          min: 0,
          max: 336,
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
    </Box>
  )
}

export default GovernanceParameters
