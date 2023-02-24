import { t, Trans } from '@lingui/macro'
import { FormField } from 'components/field'
import { Box, BoxProps, Text } from 'theme-ui'
import { decimalPattern, numberPattern } from 'utils'

// TODO: Move block to hours
const GovernanceParameters = (props: BoxProps) => {
  return (
    <Box {...props}>
      <Text variant="title" mb={4}>
        <Trans>Governance parameters</Trans>
      </Text>
      <FormField
        label={t`Snapshot delay (blocks)`}
        placeholder={t`Input number of blocks`}
        help={t`Delay (in number of blocks) since the proposal is submitted until voting power is fixed and voting starts. This can be used to enforce a delay after a proposal is published for users to buy tokens, or delegate their votes.`}
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
        help={t`Delay (in number of blocks) since the proposal starts until voting ends.`}
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
        help={t`The minimum amount of time after a proposal passes before it can be executed.`}
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
        label={t`Proposal Threshold (%)`}
        placeholder={t`Input proposal threshold`}
        help={t`The minimum percentage of stRSR ownership on an RToken to be able to create a proposal.`}
        mb={3}
        name="proposalThresholdAsMicroPercent"
        options={{
          required: true,
          pattern: decimalPattern,
          min: 0,
          max: 1,
        }}
      />
      <FormField
        label={t`Quorum (%)`}
        placeholder={t`Input quorum percent`}
        help={t`The minimum percentage of stRSR voter participation (either For or Abstain) on a proposal before it can be passed.`}
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
