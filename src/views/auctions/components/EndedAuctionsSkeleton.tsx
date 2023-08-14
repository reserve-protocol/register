import { Trans } from '@lingui/macro'
import { Box, Text } from 'theme-ui'

const EndedAuctionsSkeleton = () => {
  return (
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
        <Trans>No ended auctions</Trans>
      </Text>
    </Box>
  )
}

export default EndedAuctionsSkeleton
