import { t, Trans } from '@lingui/macro'
import { Card } from 'components'
import { FormField } from 'components/field'
import { Box, BoxProps, Divider, Text } from 'theme-ui'

const OtherForm = (props: BoxProps) => {
  return (
    <Card p={4} {...props}>
      <Box p={1} pt={0} pb={2}>
        <Text sx={{ fontSize: 3 }}>
          <Trans>Backing Manager</Trans>
        </Text>
      </Box>
      <Divider mx={-4} mb={3} />
      <FormField
        label={t`One shot pause duration (s)`}
        placeholder={t`Duration in seconds`}
        mb={3}
        name="oneshotPauseDuration"
        options={{
          required: true,
          pattern: /^[0-9]*[.]?[0-9]*$/i,
        }}
      />
      <FormField
        label={t`Trading Delay`}
        placeholder={t`Seconds`}
        mb={3}
        name="tradingDelay"
        options={{
          required: true,
        }}
      />
      <FormField
        label={t`Trading Delay`}
        placeholder={t`Seconds`}
        mb={3}
        name="tradingDelay"
        options={{
          required: true,
        }}
      />
      <FormField
        label={t`Trading Delay`}
        placeholder={t`Seconds`}
        mb={3}
        name="tradingDelay"
        options={{
          required: true,
        }}
      />
      <FormField
        label={t`Trading Delay`}
        placeholder={t`Seconds`}
        mb={3}
        name="tradingDelay"
        options={{
          required: true,
        }}
      />
    </Card>
  )
}

export default OtherForm
