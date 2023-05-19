import { Trans } from '@lingui/macro'
import { Box, Button, Text } from 'theme-ui'
import useAuctions from './useAuctions'

const ConfirmAuction = () => {
  const { tx, onExecute, fee } = useAuctions()

  return (
    <Box p={4} sx={{ borderTop: '1px solid', borderColor: 'text' }}>
      <Button disabled={!tx} onClick={onExecute} sx={{ width: '100%' }}>
        {!tx ? (
          <Trans>No auctions selected</Trans>
        ) : (
          <Text>Trigger auctions</Text>
        )}
      </Button>
    </Box>
  )
}

export default ConfirmAuction
