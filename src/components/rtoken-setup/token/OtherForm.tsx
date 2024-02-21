import { t } from '@lingui/macro'
import { FormField } from 'components/field'
import { useFormContext } from 'react-hook-form'
import { Box, BoxProps } from 'theme-ui'
import { decimalPattern, numberPattern, parseDuration } from 'utils'

/**
 * View: Deploy -> Token setup
 */
const OtherForm = (props: BoxProps) => {
  const { watch } = useFormContext()
  const [shortFreezeHelp, longFreezeHelp, unstakingDelayHelp]: string[] = watch(
    ['shortFreeze', 'longFreeze', 'unstakingDelay']
  ).map((value) => parseDuration(+value || 0))

  return (
    <Box {...props}>
      <FormField
        label={t`Short freeze duration (s)`}
        placeholder={t`Duration in seconds`}
        help={t`Short freezers have the responsibility of freezing an RToken if anything dangerous or suspicious is happening. This is a one-shot freeze and the role will be revoked after a single use. This field determines how long the RToken will remain frozen until the freeze expires or is extended by another actor.`}
        mb={3}
        helper={shortFreezeHelp}
        name="shortFreeze"
        options={{
          required: true,
          pattern: numberPattern,
          min: 21600,
          max: 604800,
        }}
      />
      <FormField
        label={t`Long freeze duration (s)`}
        placeholder={t`Duration in seconds`}
        help={t`Long freeze duration - freeze an RToken’s system for a longer period of time. A long-freezer has 6 charges before losing the ability to freeze any more`}
        mb={3}
        helper={longFreezeHelp}
        name="longFreeze"
        options={{
          required: true,
          pattern: numberPattern,
          min: 86400,
          max: 5184000,
        }}
      />
      <FormField
        label={t`Withdrawal leak (%)`}
        placeholder={t`Input withdrawal leak %`}
        help={t`The fraction of RSR stake that should be permitted to withdraw without a refresh. When cumulative withdrawals (or a single withdrawal) exceed this fraction, gas must be paid to refresh all assets.`}
        mb={3}
        name="withdrawalLeak"
        options={{
          required: true,
          pattern: decimalPattern,
          min: 0,
          max: 25,
        }}
      />
      <FormField
        label={t`Unstaking Delay (s)`}
        placeholder={t`Delay in Seconds`}
        help={t`Unstaking delay - number of seconds that all RSR unstaking must be delayed in order to account for stakers trying to frontrun defaults and needs to be longer than "governance" for proper incentives for basket changes.`}
        mb={3}
        helper={unstakingDelayHelp}
        name="unstakingDelay"
        options={{
          required: true,
          pattern: numberPattern,
          max: 63072000, // 2 year
          min: 1209600, // 2 weeks
        }}
      />
      <FormField
        label={t`Reward ratio (decimals)`}
        placeholder={t`stRSR payout fraction 0.0`}
        help={t`Reward ratio - amount of the current reward amount that should be handed out in a single block. The default corresponds to a half life of approximately 30 blocks.`}
        mb={3}
        name="rewardRatio"
        options={{
          required: true,
          pattern: decimalPattern,
          min: 0.000000534835787499996,
          max: 0.00001375292025,
        }}
      />
      <FormField
        label={t`Minimum trade volume ($)`}
        placeholder={t`Minimum trade in USD terms`}
        help={t`Minimum trade volume - minimum sized trade that can be performed, in terms of the unit of account eg. USD.`}
        mb={3}
        name="minTrade"
        options={{
          required: true,
          pattern: decimalPattern,
          max: 1000000,
          min: 10,
        }}
      />
      <FormField
        label={t`RToken Maximum trade volume ($)`}
        placeholder={t`Maximum trade for RToken`}
        help={t`Maximum trade volume - maximum sized trade for any trade involving RToken, in terms of the unit of account eg. USD.`}
        name="maxTrade"
        options={{
          required: true,
          pattern: decimalPattern,
          max: 480000000000,
          min: 0,
        }}
      />
    </Box>
  )
}

export default OtherForm
