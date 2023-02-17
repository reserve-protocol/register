import { t, Trans } from '@lingui/macro'
import { FormField } from 'components/field'
import { Box, BoxProps, Text } from 'theme-ui'
import { decimalPattern, numberPattern } from 'utils'

// TODO: Move block to hours
const GovernanceParameters = (props: BoxProps) => {
  return (
    <Box {...props}>
      <Text variant="title" mb={4} px={2}>
        <Trans>Governance parameters</Trans>
      </Text>
      <FormField
        label={t`Snapshot delay (blocks)`}
        placeholder={t`Input number of blocks`}
        mb={3}
        name="votingDelay"
        options={{
          required: true,
          pattern: numberPattern,
          min: 1,
          max: 50400,
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
          min: 7200,
          max: 100800,
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
          min: 24,
          max: 504,
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
          max: 1,
        }}
      />
      <FormField
        label={t`Quorum (%)`}
        placeholder={t`Input quorum percent`}
        mb={4}
        name="quorumPercent"
        options={{
          required: true,
          pattern: decimalPattern,
          min: 0.1,
          max: 50,
        }}
      />
    </Box>
  )
}

export default GovernanceParameters
