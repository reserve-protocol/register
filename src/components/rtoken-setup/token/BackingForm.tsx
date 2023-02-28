import { t } from '@lingui/macro'
import { FormField } from 'components/field'
import { useFormContext } from 'react-hook-form'
import { Box, BoxProps } from 'theme-ui'
import { decimalPattern, numberPattern, parseDuration } from 'utils'

/**
 * View: Deploy -> Token setup
 */
const BackingForm = (props: BoxProps) => {
  const { watch } = useFormContext()
  const [tradingDelayHelp, auctionLengthHelp]: string[] = watch([
    'tradingDelay',
    'auctionLength',
  ]).map((value) => parseDuration(+value || 0))

  return (
    <Box {...props}>
      <FormField
        label={t`Trading delay (s)`}
        placeholder={t`Delay in seconds`}
        help={t`Trading delay - how many seconds should pass after the basket has been changed, before a trade is opened. Why does this matter? To avoid losses due to poor liquidity. The default is 2160s or 36 minutes.`}
        mb={3}
        helper={tradingDelayHelp}
        name="tradingDelay"
        options={{
          required: true,
          pattern: numberPattern,
          min: 0,
          max: 86400,
        }}
      />
      <FormField
        label={t`Auction length (s)`}
        placeholder={t`Duration in Seconds`}
        help={t`Auction length - defines how long Gnosis auctions should be. Gnosis Auction is a platform enabling fair price discovery for token auctions. The aim of the platform is to make it easy for teams to discover a fair price for their token. The default value is 900s or 15 minutes.`}
        mb={3}
        helper={auctionLengthHelp}
        name="auctionLength"
        options={{
          required: true,
          pattern: numberPattern,
          max: 3600,
          min: 60,
        }}
      />
      <FormField
        label={t`Backing buffer (%)`}
        placeholder={t`Extra collateral to keep`}
        help={t`Backing buffer - percentage value that describes how much additional collateral tokens to keep in the BackingManager before forwarding tokens to the RevenueTraders. The RevenueTraders here refers to the RToken and RSR traders. Why this matters? It allows collateral tokens to be periodically converted into the RToken, which is a more efficient form of revenue production than trading each individual collateral for the desired RToken. For more info on the BackingManager and Trader types see the “Revenue distribution to RToken holders” and “Summary of revenue distribution” in our documentation. The default value is 0.01%.`}
        mb={3}
        name="backingBuffer"
        options={{
          required: true,
          pattern: decimalPattern,
          min: 0,
          max: 1,
        }}
      />
      <FormField
        label={t`Max trade slippage (%)`}
        placeholder={t`% Acceptable`}
        help={t`Max trade slippage — maximum deviation from oracle prices that any trade can clear at. The default value is 0.5%. Why this matters? Acts as a form of slippage protection.`}
        mb={3}
        name="maxTradeSlippage"
        options={{
          required: true,
          pattern: decimalPattern,
          min: 0,
          max: 5,
        }}
      />
      <FormField
        label={t`Issuance throttle rate (%)`}
        placeholder={t`Issuance throttle Rate`}
        help={t`Issuance rate - allows the issuer to limit the amount of RTokens issued per block. This matters because in an exploit where an attacker tries to issue more RTokens. This buys time for users with pause or freeze permissions to reduce the amount of RTokens that can be issued. The default is 1,000,000.`}
        mb={3}
        name="issuanceThrottleRate"
        options={{
          required: true,
          pattern: decimalPattern,
          min: 0,
          max: 50,
        }}
      />
      <FormField
        label={t`Issuance throttle amount`}
        placeholder={t`Issuance throttle amount`}
        help={t`Issuance rate - allows the issuer to limit the amount of RTokens issued per block. This matters because in an exploit where an attacker tries to issue more RTokens. This buys time for users with pause or freeze permissions to reduce the amount of RTokens that can be issued. The default is 0.025%. If an RToken gets deployed with the default settings, only 0.025% of the market cap of the RToken can be issued per block.`}
        mb={3}
        name="issuanceThrottleAmount"
        options={{
          required: true,
          pattern: decimalPattern,
          min: 0,
          max: 1e30,
        }}
      />
      <FormField
        label={t`Redemption throttle rate (%)`}
        placeholder={t`Redemption throttle Rate`}
        help={t`Redemption rate - allows the issuer to limit the amount of RTokens issued per block. This matters because in an exploit where an attacker tries to issue more RTokens. This buys time for users with pause or freeze permissions to reduce the amount of RTokens that can be issued. The default is 0.25%. If an RToken gets deployed with the default settings, only 2.5% of the market cap of the RToken can be issued per block.`}
        mb={3}
        name="redemptionThrottleRate"
        options={{
          required: true,
          pattern: decimalPattern,
          min: 0,
          max: 50,
        }}
      />
      <FormField
        label={t`Redemption throttle amount`}
        placeholder={t`Redemption throttle amount`}
        help={t`Redemption rate - allows the issuer to limit the amount of RTokens issued per block. This matters because in an exploit where an attacker tries to issue more RTokens. This buys time for users with pause or freeze permissions to reduce the amount of RTokens that can be issued. The default is 1,000,000.`}
        name="redemptionThrottleAmount"
        options={{
          required: true,
          pattern: decimalPattern,
          min: 0,
          max: 1e30,
        }}
      />
    </Box>
  )
}

export default BackingForm
