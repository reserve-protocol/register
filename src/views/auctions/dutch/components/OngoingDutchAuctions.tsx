import { Trans } from '@lingui/macro'
import { Box, Text } from 'theme-ui'
import { DutchTrade } from 'views/auctions/atoms'
import DutchAuction from './DutchAuction'

const mockData: DutchTrade[] = [
  {
    id: '123',
    amount: 123,
    auctionId: 123, // Dont know about this, related to gnosis
    buying: 'rsrContract',
    buyingTokenSymbol: 'RSR',
    sellingTokenSymbol: 'cUSDC',
    endAt: 12345,
    selling: 'cUSDC contract',
    startedAt: 12,
    worstCasePrice: 123,
  },
]

const OngoingDutchAuctions = () => {
  return (
    <Box>
      <Text variant="strong" ml={4} mb={4}>
        <Trans>Ongoing dutch auctions</Trans>
      </Text>
      {mockData.map((trade) => (
        <DutchAuction data={trade} />
      ))}
    </Box>
  )
}

export default OngoingDutchAuctions
