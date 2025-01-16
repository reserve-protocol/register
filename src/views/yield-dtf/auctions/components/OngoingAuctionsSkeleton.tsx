import useRToken from 'hooks/useRToken'
import { useSetAtom } from 'jotai'
import { Box, Link, Text } from 'theme-ui'
import { auctionSidebarAtom } from '../atoms'

const OngoingAuctionsSkeleton = () => {
  const rToken = useRToken()
  const setSidebar = useSetAtom(auctionSidebarAtom)

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
        No ongoing {rToken?.symbol ?? 'rtoken'}-related auctions. Check for
        available auctions/unrealized revenue{' '}
        <Link
          onClick={() => setSidebar(true)}
          sx={{ textDecoration: 'underline', color: 'text' }}
        >
          here
        </Link>{' '}
        if you want to poke the protocol to start the next auction.
      </Text>
    </Box>
  )
}

export default OngoingAuctionsSkeleton
