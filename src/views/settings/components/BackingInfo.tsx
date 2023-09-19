import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { isModuleLegacyAtom, rTokenConfigurationAtom } from 'state/atoms'
import { Card, Text, Divider } from 'theme-ui'
import { formatCurrency, formatPercentage, parseDuration } from 'utils'

/**
 * View: Settings > Display RToken backing contracts configuration
 */
const BackingInfo = () => {
  const rToken = useRToken()
  const params = useAtomValue(rTokenConfigurationAtom)
  const { auctions: isLegacy, issuance: isIssuanceLegacy } =
    useAtomValue(isModuleLegacyAtom)

  const placeholder = 'Loading...'

  return (
    <Card p={4}>
      <Text variant="title">
        <Trans>Backing Parameters</Trans>
      </Text>
      <Divider mx={-4} my={4} sx={{ borderColor: 'darkBorder' }} />
      {!isIssuanceLegacy && (
        <>
          <InfoItem
            title={t`Basket warmup period`}
            subtitle={
              params ? parseDuration(+params.warmupPeriod) : placeholder
            }
            mb={3}
          />
          <InfoItem
            title={t`Withdrawal leak`}
            subtitle={
              params ? formatPercentage(+params.withdrawalLeak) : placeholder
            }
            mb={3}
          />
        </>
      )}
      <InfoItem
        title={t`Trading delay`}
        subtitle={params ? parseDuration(+params.tradingDelay) : placeholder}
        mb={3}
      />
      <InfoItem
        title={t`Batch auction length`}
        subtitle={
          params ? parseDuration(+params.batchAuctionLength) : placeholder
        }
        mb={3}
      />
      {!isLegacy && (
        <InfoItem
          title={t`Dutch auction length`}
          subtitle={
            params ? parseDuration(+params.dutchAuctionLength) : placeholder
          }
          mb={3}
        />
      )}
      <InfoItem
        title={t`Backing buffer`}
        subtitle={
          params ? formatPercentage(+params.backingBuffer) : placeholder
        }
        mb={3}
      />
      <InfoItem
        title={t`Max trade slippage`}
        subtitle={
          params ? formatPercentage(+params.maxTradeSlippage) : placeholder
        }
        mb={3}
      />
      <InfoItem
        title={t`Issuance throttle rate`}
        subtitle={
          params ? formatPercentage(+params.issuanceThrottleRate) : placeholder
        }
        mb={3}
      />
      <InfoItem
        title={t`Issuance throttle amount`}
        subtitle={
          params
            ? `${formatCurrency(+params.issuanceThrottleAmount)} ${
                rToken?.symbol
              }`
            : placeholder
        }
        mb={3}
      />
      <InfoItem
        title={t`Redemption throttle rate`}
        subtitle={
          params
            ? formatPercentage(+params.redemptionThrottleRate)
            : placeholder
        }
        mb={3}
      />
      <InfoItem
        title={t`Redemption throttle amount`}
        subtitle={
          params
            ? `${formatCurrency(+params.redemptionThrottleAmount)} ${
                rToken?.symbol
              }`
            : placeholder
        }
        mb={3}
      />
    </Card>
  )
}

export default BackingInfo
