import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenParamsAtom } from 'state/atoms'
import { Card, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

/**
 * View: Settings > Display RToken backing contracts configuration
 */
const BackingInfo = () => {
  const params = useAtomValue(rTokenParamsAtom)

  return (
    <Card p={4}>
      <Text variant="sectionTitle" mb={5}>
        <Trans>Backing parameters</Trans>
      </Text>
      <InfoItem
        title={t`Trading delay (s)`}
        subtitle={params.tradingDelay}
        mb={3}
      />
      <InfoItem
        title={t`Auction length (s)`}
        subtitle={params.auctionLength}
        mb={3}
      />
      <InfoItem
        title={t`Backing buffer (%)`}
        subtitle={params.backingBuffer}
        mb={3}
      />
      <InfoItem
        title={t`Max trade slippage (%)`}
        subtitle={params.maxTradeSlippage}
        mb={3}
      />
      <InfoItem
        title={t`Issuance throttle rate (%)`}
        subtitle={params.issuanceThrottleRate}
        mb={3}
      />
      <InfoItem
        title={t`Issuance throttle amount`}
        subtitle={formatCurrency(+params.issuanceThrottleAmount)}
        mb={3}
      />
      <InfoItem
        title={t`Redemption throttle rate (%)`}
        subtitle={params.redemptionThrottleRate}
        mb={3}
      />
      <InfoItem
        title={t`Redemption throttle amount`}
        subtitle={formatCurrency(+params.redemptionThrottleAmount)}
        mb={3}
      />
    </Card>
  )
}

export default BackingInfo
