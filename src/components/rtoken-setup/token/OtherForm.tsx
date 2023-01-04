import { t, Trans } from '@lingui/macro'
import Field, { FormField } from 'components/field'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Box, BoxProps, Slider, Text } from 'theme-ui'
import { decimalPattern, numberPattern } from 'utils'

/**
 * View: Deploy -> Token setup
 */
const OtherForm = (props: BoxProps) => (
  <Box {...props}>
    <FormField
      label={t`Short freeze duration (s)`}
      placeholder={t`Duration in seconds`}
      help={t`Reward distribution - sliding scale that determines what percentage of the reward goes to RToken Holders and what percentage goes to RSR Stakers. The default is 40% to RToken Holders and 60% to RSR stakers. For more info see the appropriate sections on “Revenue distribution” here.`}
      mb={3}
      name="shortFreeze"
      options={{
        required: true,
        pattern: numberPattern,
        min: 3600, // 1hour
        max: 2592000, //1month
      }}
    />
    <FormField
      label={t`Long freeze duration (s)`}
      placeholder={t`Duration in seconds`}
      help={t`Short freeze duration - number of seconds an initial freeze lasts. The default is 259200s or 3 days. This provides the ability to freeze an RToken’s system for a short period of time which is useful to thwart an attack.`}
      mb={3}
      name="longFreeze"
      options={{
        required: true,
        pattern: numberPattern,
        min: 86400, // 1day
        max: 31536000, //1year
      }}
    />
    <FormField
      label={t`Unstaking Delay (s)`}
      placeholder={t`Delay in Seconds`}
      help={t`Long freeze duration - freeze an RToken’s system for a longer period of time. The default value is 2592000s or 30 days.
      `}
      mb={3}
      name="unstakingDelay"
      options={{
        required: true,
        pattern: numberPattern,
        max: 31536000, // 1year
        min: 1,
      }}
    />
    <FormField
      label={t`Reward period (s)`}
      placeholder={t`Seconds`}
      help={t`Un-staking delay - number of seconds that all RSR un-staking must be delayed in order to account for stakers trying to frontrun defaults. The default is 1209600s or 2 weeks.`}
      mb={3}
      name="rewardPeriod"
      options={{
        required: true,
        pattern: numberPattern,
        min: 10,
        max: 31536000, // 1year
      }}
    />
    <FormField
      label={t`Reward ratio (decimals)`}
      placeholder={t`stRSR payout fraction 0.0`}
      help={t`Reward period - length of time that comprises a single period. Works in conjunction with reward ratio (see below) to determine the desired payout rate. The default is 604800s or 7 days.`}
      mb={3}
      name="rewardRatio"
      options={{
        required: true,
        pattern: decimalPattern,
        min: 0.000000001,
        max: 1,
      }}
    />
    <FormField
      label={t`Minimum trade volume`}
      placeholder={t`Minimum trade`}
      help={t`Minimum trade volume - minimum sized trade that can be performed, in terms of the unit of account eg. USD. The default is $10K.`}
      mb={3}
      name="minTrade"
      options={{
        required: true,
        pattern: decimalPattern,
        max: 10000000,
        min: 0,
      }}
    />
    <FormField
      label={t`RToken Maximum trade volume`}
      placeholder={t`Maximum trade for RToken`}
      help={t`Maximum trade volume - maximum sized trade for any trade involving RToken, in terms of the unit of account eg. USD. The default is $1M.`}
      mb={3}
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
