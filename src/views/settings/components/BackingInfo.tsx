import { InfoHeading } from 'components/info-box'
import { useAtomValue } from 'jotai'
import { rTokenParamsAtom } from 'state/atoms'
import { Card, Divider, Text } from 'theme-ui'

const BackingInfo = () => {
  const params = useAtomValue(rTokenParamsAtom)

  return (
    <Card p={4}>
      <Text variant="sectionTitle">Backing parameters</Text>
      <Divider my={4} mx={-4} sx={{ borderColor: 'darkBorder' }} />

      <InfoHeading
        title="Trading delay (s)"
        subtitle={params.tradingDelay}
        mb={3}
      />
      <InfoHeading
        title="Auction length (s)"
        subtitle={params.auctionLength}
        mb={3}
      />
      <InfoHeading
        title="Backing buffer (%)"
        subtitle={params.backingBuffer}
        mb={3}
      />
      <InfoHeading
        title="Max trade slippage (%) (s)"
        subtitle={params.maxTradeSlippage}
        mb={3}
      />
      <InfoHeading
        title="Issuance rate (%)"
        subtitle={params.issuanceRate}
        mb={3}
      />
      <InfoHeading
        title="Scaling Redemption Rate (%)"
        subtitle={params.scalingRedemptionRate}
        mb={3}
      />
      <InfoHeading
        title="Redemption rate floor"
        subtitle={params.redemptionRateFloor}
        mb={3}
      />
    </Card>
  )
}

export default BackingInfo
