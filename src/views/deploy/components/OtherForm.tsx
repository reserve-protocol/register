import { t, Trans } from '@lingui/macro'
import Field, { FormField } from 'components/field'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Box, BoxProps, Slider, Text } from 'theme-ui'
import { decimalPattern, numberPattern } from 'utils'

/**
 * View: Deploy -> Token setup
 */
const OtherForm = (props: BoxProps) => {
  const { getValues, setValue, watch } = useFormContext()
  const { rTokenDist, rsrDist } = getValues()
  const [, setDist] = useState(rTokenDist)
  const minTrade = watch('minTrade')
  const maxTrade = watch('maxTrade')

  const handleChange = (e: any) => {
    const value = Number(e.target.value)
    setValue('rTokenDist', value)
    setValue('rsrDist', 100 - value)
    setDist(value)
  }

  return (
    <Box {...props}>
      <Text variant="title" mb={4}>
        <Trans>Other</Trans>
      </Text>
      <Field
        label={t`Reward distribution [${rTokenDist}% rToken - ${rsrDist}% RSR]`}
        mb={4}
      >
        <Box mx={2} mt={4}>
          <Slider onChange={handleChange} defaultValue={rTokenDist} />
        </Box>
      </Field>
      <FormField
        label={t`One shot freeze duration (s)`}
        placeholder={t`Duration in seconds`}
        mb={3}
        name="oneshotFreezeDuration"
        options={{
          required: true,
          pattern: numberPattern,
          min: 3600,
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
          max: maxTrade,
          min: 0.01,
        }}
      />
      <FormField
        label={t`Maximum trade volume`}
        placeholder={t`Maximum trade`}
        mb={3}
        name="maxTrade"
        options={{
          required: true,
          pattern: decimalPattern,
          max: 480000000000,
          min: minTrade,
        }}
      />
    </Box>
  )
}

export default OtherForm
