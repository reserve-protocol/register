import { t } from '@lingui/macro'
import { FormField } from 'components/field'
import { Box, BoxProps } from 'theme-ui'
import { decimalPattern, numberPattern } from 'utils'

/**
 * View: Deploy -> Token setup
 */
const OtherForm = (props: BoxProps) => (
  <Box {...props}>
    <FormField
      label={t`Short freeze duration (s)`}
      placeholder={t`Duration in seconds`}
      help={t`Short freezers have the responsibility of freezing an RToken if anything dangerous or suspicious is happening. This is a one-shot freeze and the role will be revoked after a single use. This field determines how long the RToken will remain frozen until the freeze expires or is extended by another actor. The default is 259200 second, or 3 days which we believe is enough time for appropriate parties to act.`}
      mb={3}
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
      help={t`Long freeze duration - freeze an RToken’s system for a longer period of time. The default value is 2592000s or 30 days.`}
      mb={3}
      name="longFreeze"
      options={{
        required: true,
        pattern: numberPattern,
        min: 86400,
        max: 5184000,
      }}
    />
    <FormField
      label={t`Unstaking Delay (s)`}
      placeholder={t`Delay in Seconds`}
      help={t`Unstaking delay - number of seconds that all RSR unstaking must be delayed in order to account for stakers trying to frontrun defaults and needs to be longer than "governance" for proper incentives for basket changes. The default is 1209600s or 2 weeks.`}
      mb={3}
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
      help={t`Reward ratio - amount of the current reward amount that should be handed out in a single period. Works in conjunction with reward period (see above) to determine the desired payout rate. The default is 0.0000032090147. This is approximately half life of 30 pay periods.`}
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
      help={t`Minimum trade volume - minimum sized trade that can be performed, in terms of the unit of account eg. USD. The default is $10K.`}
      mb={3}
      name="minTrade"
      options={{
        required: true,
        pattern: decimalPattern,
        max: 1000000,
        min: 1000,
      }}
    />
    <FormField
      label={t`RToken Maximum trade volume ($)`}
      placeholder={t`Maximum trade for RToken`}
      help={t`Maximum trade volume - maximum sized trade for any trade involving RToken, in terms of the unit of account eg. USD. The default is $1M.`}
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

export default OtherForm
