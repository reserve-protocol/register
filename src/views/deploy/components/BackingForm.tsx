import { t, Trans } from '@lingui/macro'
import { FormField } from 'components/field'
import { Box, BoxProps, Text } from 'theme-ui'
import { decimalPattern, numberPattern } from 'utils'

/**
 * View: Deploy -> Token setup
 */
const BackingForm = (props: BoxProps) => (
  <Box {...props}>
    <Text variant="title" mb={4}>
      <Trans>Backing Manager</Trans>
    </Text>
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
        max: 604800, // 1 week
        min: 60,
      }}
    />
    <FormField
      label={t`Backing buffer (%)`}
      placeholder={t`Extra collateral to keep`}
      mb={3}
      name="backingBuffer"
      options={{
        required: true,
        pattern: decimalPattern,
        min: 0,
        max: 100,
      }}
    />
    <FormField
      label={t`Max trade slippage (%)`}
      placeholder={t`% Acceptable`}
      mb={3}
      name="maxTradeSlippage"
      options={{
        required: true,
        pattern: decimalPattern,
        min: 0.01,
        max: 5,
      }}
    />
    <FormField
      label={t`Issuance rate (%)`}
      placeholder={t`Rate`}
      mb={3}
      name="issuanceRate"
      options={{
        required: true,
        pattern: decimalPattern,
        min: 0.001,
        max: 1001,
      }}
    />
    <FormField
      label={t`Scaling Redemption Rate (%)`}
      placeholder={t`Max % per hour`}
      mb={3}
      name="scalingRedemptionRate"
      options={{
        required: true,
        pattern: decimalPattern,
        min: 0,
        max: 100,
      }}
    />
    <FormField
      label={t`Redemption rate floor`}
      placeholder={t`Redemption rate`}
      mb={3}
      name="redemptionRateFloor"
      options={{
        required: true,
        pattern: decimalPattern,
        min: 0,
      }}
    />
  </Box>
)

export default BackingForm
