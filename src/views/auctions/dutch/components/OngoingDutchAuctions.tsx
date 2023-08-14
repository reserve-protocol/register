import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { Box, Text } from 'theme-ui'
import { ongoingDutchTradesAtom } from '../atoms'
import DutchAuction from './DutchAuction'

const OngoingDutchAuctions = () => {
  const trades = useAtomValue(ongoingDutchTradesAtom)

  return (
    <Box>
      <Text variant="strong" ml={4} mb={4}>
        <Trans>Ongoing dutch auctions</Trans>
      </Text>
      {trades.map((trade) => (
        <DutchAuction key={trade.id} data={trade} />
      ))}
    </Box>
  )
}

export default OngoingDutchAuctions
