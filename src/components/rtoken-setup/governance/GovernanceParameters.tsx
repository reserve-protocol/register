import { t, Trans } from '@lingui/macro'
import { FormField } from 'components/field'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { secondsPerBlockAtom } from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'
import { decimalPattern, numberPattern, parseDuration } from 'utils'
import { timeToBlocks } from '../atoms'

interface IGovernanceParameters extends BoxProps {
  timebased?: boolean
}

const GovernanceParameters = ({
  timebased = true,
  ...props
}: IGovernanceParameters) => {
  const secondsPerBlock = useAtomValue(secondsPerBlockAtom)
  const { watch } = useFormContext()
  const [votingDelay, votingPeriod, minDelay] = watch([
    'votingDelay',
    'votingPeriod',
    'minDelay',
  ])
  const [votingDelayHelper, votingPeriodHelper, minDelayHelper] =
    useMemo(() => {
      let votingDelayHelper = parseDuration(
        (Number(votingDelay) || 0) * 60 * 60
      )
      let votingPeriodHelper = parseDuration(
        (Number(votingPeriod) || 0) * 60 * 60
      )
      let minDelayHelper = parseDuration((Number(minDelay) || 0) * 60 * 60)

      if (!timebased) {
        votingDelayHelper = parseDuration(
          Number(votingDelay) * secondsPerBlock || 0
        )
        votingPeriodHelper = parseDuration(
          Number(votingPeriod) * secondsPerBlock || 0
        )
      }

      return [votingDelayHelper, votingPeriodHelper, minDelayHelper]
    }, [timebased, secondsPerBlock, votingDelay, votingPeriod, minDelay])

  return (
    <Box {...props}>
      <Text variant="title" mb={4}>
        <Trans>Governance parameters</Trans>
      </Text>
      <FormField
        label={`Snapshot delay ${timebased ? '(hours)' : '(blocks)'}`}
        placeholder={t`Input delay`}
        helper={votingDelayHelper}
        help={`Delay (in number of ${
          timebased ? 'hours' : 'blocks'
        }) since the proposal is submitted until voting power is fixed and voting starts. This can be used to enforce a delay after a proposal is published for users to buy tokens, or delegate their votes.`}
        mb={3}
        name="votingDelay"
        options={{
          required: true,
          pattern: numberPattern,
          min: 24,
          max: timebased ? 168 : timeToBlocks(604800, secondsPerBlock), // 1 week
        }}
      />
      <FormField
        label={`Voting period ${timebased ? '(hours)' : '(blocks)'}`}
        placeholder={t`Input voting period`}
        helper={votingPeriodHelper}
        help={t`Delay (in number of ${
          timebased ? 'hours' : 'blocks'
        }) since the proposal starts until voting ends.`}
        mb={4}
        name="votingPeriod"
        options={{
          required: true,
          pattern: numberPattern,
          min: timebased ? 1 : 7200,
          max: timebased ? 336 : timeToBlocks(1209600, secondsPerBlock), // 2 weeks
        }}
      />
      <FormField
        label={t`Proposal execution delay (hours)`}
        placeholder={t`Input delay in hours`}
        helper={minDelayHelper}
        help={t`The minimum amount of time after a proposal passes before it can be executed.`}
        mb={3}
        name="minDelay"
        options={{
          required: true,
          pattern: numberPattern,
          min: 1,
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
