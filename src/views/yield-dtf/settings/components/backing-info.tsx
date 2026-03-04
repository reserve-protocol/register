import { t } from '@lingui/macro'
import useRToken from '@/hooks/useRToken'
import { useAtomValue } from 'jotai'
import { isModuleLegacyAtom, rTokenConfigurationAtom } from '@/state/atoms'
import { formatCurrency, formatPercentage, parseDuration } from '@/utils'
import { InfoCard, InfoCardItem } from './settings-info-card'

const BackingInfo = () => {
  const rToken = useRToken()
  const params = useAtomValue(rTokenConfigurationAtom)
  const { auctions: isLegacy, issuance: isIssuanceLegacy } =
    useAtomValue(isModuleLegacyAtom)

  return (
    <InfoCard title={t`Backing Parameters`}>
      {!isIssuanceLegacy && (
        <>
          <InfoCardItem
            label={t`Basket warmup period`}
            value={params ? parseDuration(+params.warmupPeriod) : undefined}
            border={false}
          />
          <InfoCardItem
            label={t`Withdrawal leak`}
            value={
              params ? formatPercentage(+params.withdrawalLeak) : undefined
            }
          />
        </>
      )}
      <InfoCardItem
        label={t`Trading delay`}
        value={params ? parseDuration(+params.tradingDelay) : undefined}
        border={!isIssuanceLegacy}
      />
      <InfoCardItem
        label={t`Batch auction length`}
        value={params ? parseDuration(+params.batchAuctionLength) : undefined}
      />
      {!isLegacy && (
        <InfoCardItem
          label={t`Dutch auction length`}
          value={params ? parseDuration(+params.dutchAuctionLength) : undefined}
        />
      )}
      <InfoCardItem
        label={t`Backing buffer`}
        value={params ? formatPercentage(+params.backingBuffer) : undefined}
      />
      <InfoCardItem
        label={t`Max trade slippage`}
        value={params ? formatPercentage(+params.maxTradeSlippage) : undefined}
      />
      <InfoCardItem
        label={t`Issuance throttle rate`}
        value={
          params ? formatPercentage(+params.issuanceThrottleRate) : undefined
        }
      />
      <InfoCardItem
        label={t`Issuance throttle amount`}
        value={
          params
            ? `${formatCurrency(+params.issuanceThrottleAmount)} ${rToken?.symbol}`
            : undefined
        }
      />
      <InfoCardItem
        label={t`Redemption throttle rate`}
        value={
          params ? formatPercentage(+params.redemptionThrottleRate) : undefined
        }
      />
      <InfoCardItem
        label={t`Redemption throttle amount`}
        value={
          params
            ? `${formatCurrency(+params.redemptionThrottleAmount)} ${rToken?.symbol}`
            : undefined
        }
      />
    </InfoCard>
  )
}

export default BackingInfo
