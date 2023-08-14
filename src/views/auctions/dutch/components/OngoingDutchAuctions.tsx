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
      {!trades.length && (
        <Box
          sx={{
            border: '1px dashed',
            borderColor: 'border',
            textAlign: 'center',
            borderRadius: 16,
          }}
          p={6}
        >
          <Text variant="legend">
            <Trans>No ongoing auctions</Trans>
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default OngoingDutchAuctions
