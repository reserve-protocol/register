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
        help={t`Trading delay - how many seconds should pass after the basket has been changed, before a rebalancing trade is opened. Why does this matter? To avoid losses due to poor liquidity.`}
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
        help={t`Auction length - defines how long Gnosis EasyAuction auctions should be. Gnosis EasyAuction is a platform enabling fair price discovery for tokens through the use of batch auctions.`}
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
        help={t`Backing buffer - percentage value that describes how much additional collateral tokens to keep in the BackingManager before forwarding tokens to the RevenueTraders. The RevenueTraders here refers to the RToken and RSR traders. Why this matters? It allows collateral tokens to be periodically converted into the RToken, which is a more efficient form of revenue production than trading each individual collateral for the desired RToken. It also provides a buffer to prevent RSR seizure after trading slippage. For more info on the BackingManager and Trader types see the “Revenue distribution to RToken holders” and “Summary of revenue distribution” in our documentation.`}
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
        help={t`Max trade slippage — maximum deviation from oracle prices that any trade can clear at. Why this matters? Acts as a form of slippage protection.`}
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
        help={t`Issuance rate - allows the issuer to limit the amount of RTokens issued per hour based on a percentage of the current RToken market cap. This matters in the event of an exploit where an attacker tries to issue more RTokens. This buys time for users with pause or freeze permissions to reduce the amount of RTokens that can be issued.`}
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
        help={t`Issuance amount - allows the issuer to limit the amount of RTokens issued per hour. This matters in the event of an exploit where an attacker tries to issue more RTokens. This buys time for users with pause or freeze permissions to reduce the amount of RTokens that can be issued.`}
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
        help={t`Redemption rate - allows the issuer to limit the amount of RTokens redeemed per hour based on a percentage of the current RToken market cap. This matters in the event of an exploit where an attacker tries to redeem RTokens. This buys time for users with pause or freeze permissions to reduce the amount of RTokens that can be redeemed.`}
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
        help={t`Redemption amount - allows the issuer to limit the amount of RTokens redeemed per hour. This matters in the event of an exploit where an attacker tries to redeem RTokens.This buys time for users with pause or freeze permissions to reduce the amount of RTokens that can be redeemed.`}
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
