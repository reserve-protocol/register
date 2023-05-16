import { Trans } from '@lingui/macro'
import { Box, Button, Text } from 'theme-ui'
import useAuctions from './useAuctions'

const ConfirmAuction = () => {
  const { txs, onExecute, fee } = useAuctions()
  const noAuctions = !txs.length

  return (
    <Box p={4} sx={{ borderTop: '1px solid', borderColor: 'text' }}>
      <Button disabled={noAuctions} onClick={onExecute} sx={{ width: '100%' }}>
        {noAuctions ? (
          <Trans>No auctions selected</Trans>
        ) : (
          <Text>Trigger {txs.length} auctions</Text>
        )}
      </Button>
    </Box>
  )
}

export default ConfirmAuction
