import { t, Trans } from '@lingui/macro'
import { FormField } from 'components/field'
import { Box, BoxProps, Text } from 'theme-ui'
import { decimalPattern, numberPattern } from 'utils'

/**
 * View: Deploy -> Token setup
 */
const BackingForm = (props: BoxProps) => (
  <Box {...props}>
    <FormField
      label={t`Trading delay (s)`}
      placeholder={t`Delay in seconds`}
      help={t`Trading delay - how many seconds should pass after the basket has been changed, before a trade is opened. Why does this matter? To avoid losses due to poor liquidity. The default is 2160s or 36 minutes.`}
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
      help={t`Auction length - defines how long Gnosis auctions should be. Gnosis Auction is a platform enabling fair price discovery for token auctions. The aim of the platform is to make it easy for teams to discover a fair price for their token. The default value is 900s or 15 minutes.`}
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
      help={t`Backing buffer - percentage value that describes how much additional collateral tokens to keep in the BackingManager before forwarding tokens to the RevenueTraders. The RevenueTraders here refers to the RToken and RSR traders. Why this matters? It allows collateral tokens to be periodically converted into the RToken, which is a more efficient form of revenue production than trading each individual collateral for the desired RToken. For more info on the BackingManager and Trader types see the “Revenue distribution to RToken holders” and “Summary of revenue distribution” <a href=\"http://www.example.com\">here</a>. The default value is 0.01%.`}
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
      help={t`Max trade slippage — maximum deviation from oracle prices that any trade can clear at. The default value is 1%. Why this matters? Acts as a form of slippage protection.`}
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
      help={t`Issuance rate - allows the issuer to limit the amount of RTokens issued per block. This matters because in an exploit where an attacker tries to issue more RTokens. This buys time for users with pause or freeze permissions to reduce the amount of RTokens that can be issued. The default is 0.025%. If an RToken gets deployed with the default settings, only 0.025% of the market cap of the RToken can be issued per block. For more info see the “Issuance throttle” section here.`}
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
      help={t`Scaling redemption rate - percentage value that describes what proportion of the RToken supply to allow redemption of per-hour. It controls how quickly the protocol can scale down RToken supply. The default is 5%. For more info see “Redemption throttle” section here. Goes hand in hand with redemption rate floor below.`}
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
      help={t`Redemption rate floor - minimum quantity of RToken to allow redemption of per-hour, and thereby the rate to charge the redemption battery at. The default is 1,000,000 RTokens. Goes hand in hand with scaling redemption rate above.`}
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
