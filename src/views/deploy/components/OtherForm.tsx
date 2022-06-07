import { t, Trans } from '@lingui/macro'
import { Card } from 'components'
import Field, { FormField } from 'components/field'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Box, BoxProps, Divider, Slider, Text } from 'theme-ui'
import { decimalPattern, numberPattern } from 'utils'

const OtherForm = (props: BoxProps) => {
  const { getValues, setValue } = useFormContext()
  const { rTokenDist, rsrDist } = getValues()
  const [, setDist] = useState(rTokenDist)

  const handleChange = (e: any) => {
    const value = Number(e.target.value)
    setValue('rTokenDist', value)
    setValue('rsrDist', 100 - value)
    setDist(value)
  }

  return (
    <Card p={4} {...props}>
      <Box p={1} pt={0} pb={2}>
        <Text sx={{ fontSize: 3 }}>
          <Trans>Other</Trans>
        </Text>
      </Box>
      <Divider mx={-4} mb={3} />
      <Field
        label={t`Reward distribution [${rTokenDist}% rToken - ${rsrDist}% RSR]`}
        mb={4}
      >
        <Box mx={2} mt={4}>
          <Slider onChange={handleChange} defaultValue={rTokenDist} />
        </Box>
      </Field>
      <FormField
        label={t`One shot pause duration (s)`}
        placeholder={t`Duration in seconds`}
        mb={3}
        name="oneshotPauseDuration"
        options={{
          required: true,
          pattern: numberPattern,
          min: 3600,
          max: 31536000,
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
          max: 31536000,
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
          max: 31536000,
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
        label={t`Max trade volume`}
        placeholder={t`Amount`}
        name="maxTradeVolume"
        options={{
          required: true,
          pattern: decimalPattern,
          min: 1000,
          max: 1000000000,
        }}
      />
    </Card>
  )
}

export default OtherForm
