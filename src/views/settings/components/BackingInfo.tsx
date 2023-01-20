import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenParamsAtom } from 'state/atoms'
import { Card, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

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
        title={t`Max trade slippage (%) (s)`}
        subtitle={params.maxTradeSlippage}
        mb={3}
      />
      <InfoItem
        title={t`Issuance rate (%)`}
        subtitle={params.issuanceRate}
        mb={3}
      />
      <InfoItem
        title={t`Scaling Redemption Rate (%)`}
        subtitle={params.scalingRedemptionRate}
        mb={3}
      />
      <InfoItem
        title={t`Redemption rate floor`}
        subtitle={formatCurrency(+params.redemptionRateFloor)}
      />
    </Card>
  )
}

export default BackingInfo
