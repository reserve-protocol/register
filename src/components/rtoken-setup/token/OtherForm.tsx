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
    <Text variant="title" mb={4}>
      <Trans>Other</Trans>
    </Text>
    <FormField
      label={t`Short freeze duration (s)`}
      placeholder={t`Duration in seconds`}
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
