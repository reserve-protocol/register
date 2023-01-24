import { t, Trans } from '@lingui/macro'
import { FormField } from 'components/field'
import { Box, BoxProps, Text } from 'theme-ui'
import { numberPattern } from 'utils'

const GovernanceParameters = (props: BoxProps) => {
  return (
    <Box {...props}>
      <Text variant="title" mb={4}>
        <Trans>Governance parameters</Trans>
      </Text>
      <FormField
        label={t`Voting delay (blocks)`}
        placeholder={t`Input number of blocks`}
        help={t`Delay (in number of blocks) since the proposal is submitted until voting power is fixed and voting starts. This can be used to enforce a delay after a proposal is published for users to buy tokens, or delegate their votes.`}
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
        help={t`Delay (in number of blocks) since the proposal starts until voting ends.`}
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
          min: 0,
          max: 336,
        }}
      />
    </Box>
  )
}

export default GovernanceParameters
