import { t, Trans } from '@lingui/macro'
import { Card } from 'components'
import { FormField } from 'components/field'
import { Box, BoxProps, Divider, Text } from 'theme-ui'
import { numberPattern, decimalPattern } from 'utils'

const BackingForm = (props: BoxProps) => {
  return (
    <Card p={4} {...props}>
      <Box p={1} pt={0} pb={2}>
        <Text sx={{ fontSize: 3 }}>
          <Trans>Backing Manager</Trans>
        </Text>
      </Box>
      <Divider mx={-4} mb={3} />
      <FormField
        label={t`Trading delay (s)`}
        placeholder={t`Delay in seconds`}
        mb={3}
        name="tradingDelay"
        options={{
          required: true,
          pattern: numberPattern,
          min: 0,
          max: 604800,
        }}
      />
      <FormField
        label={t`Auction length (s)`}
        placeholder={t`Duration in Seconds`}
        mb={3}
        name="auctionLength"
        options={{
          required: true,
          pattern: numberPattern,
          max: 60,
          min: 3600,
        }}
      />
      <FormField
        label={t`Backing buffer (decimals %)`}
        placeholder={t`Extra collateral to keep`}
        mb={3}
        name="backingBuffer"
        options={{
          required: true,
          pattern: decimalPattern,
          min: 10,
          max: 31536000,
        }}
      />
      <FormField
        label={t`Max trade slippage (decimals %)`}
        placeholder={t`% Acceptable`}
        mb={3}
        name="maxTradeSlippage"
        options={{
          required: true,
          pattern: decimalPattern,
          min: 0.000000001,
          max: 1,
        }}
      />
      <FormField
        label={t`Issuance rate (decimals)`}
        placeholder={t`Rate`}
        mb={3}
        name="issuanceRate"
        options={{
          required: true,
          pattern: decimalPattern,
          min: 0.000000001,
          max: 0.01,
        }}
      />
      <FormField
        label={t`Dust amount`}
        placeholder={t`Dust Amount`}
        mb={3}
        name="dustAmount"
        options={{
          required: true,
          pattern: numberPattern,
          min: 1,
          max: 1000000000,
        }}
      />
    </Card>
  )
}

export default BackingForm
