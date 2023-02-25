import { t, Trans } from '@lingui/macro'
import { InfoItem } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenParamsAtom } from 'state/atoms'
import { Card, Text, Divider } from 'theme-ui'
import { formatCurrency, parseDuration } from 'utils'

/**
 * View: Settings > Display RToken backing contracts configuration
 */
const BackingInfo = () => {
  const params = useAtomValue(rTokenParamsAtom)

  return (
    <Card p={4}>
      <Text variant="sectionTitle">
        <Trans>Backing Parameters</Trans>
      </Text>
      <Divider mx={-4} my={4} sx={{ borderColor: 'darkBorder' }} />
      <InfoItem
        title={t`Trading delay`}
        subtitle={parseDuration(+params.tradingDelay)}
        mb={3}
      />
      <InfoItem
        title={t`Auction length`}
        subtitle={parseDuration(+params.auctionLength)}
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
