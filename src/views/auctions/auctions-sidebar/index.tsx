import { Trans } from '@lingui/macro'
import Sidebar from 'components/sidebar'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { X } from 'react-feather'
import { Box, Button, Divider, Flex, Text } from 'theme-ui'
import { auctionSessionAtom } from '../atoms'
import ConfirmAuction from './ConfirmAuction'
import RecollaterizationAlert from './RecollaterizationAlert'
import RevenueAuctionList from './RevenueAuctionList'
import RevenueOverview from './RevenueOverview'
import SettleableAuctions from './SettleableAuctions'

const Header = ({ onClose }: { onClose(): void }) => (
  <Flex
    sx={{
      alignItems: 'center',
      flexShrink: 0,
    }}
    px={[3, 5]}
    pt={3}
  >
    <Text variant="sectionTitle" mr={1}>
      <Trans>Auctions</Trans>
    </Text>
    <Button variant="circle" ml="auto" onClick={onClose}>
      <X />
    </Button>
  </Flex>
)

const AuctionsSidebar = ({ onClose }: { onClose(): void }) => {
  const setSession = useSetAtom(auctionSessionAtom)

  useEffect(() => {
    setSession(Math.random())
  }, [])

  return (
    <Sidebar onClose={onClose} width="600px">
      <Header onClose={onClose} />
      <RevenueOverview />
      <Divider my={4} />
      <RecollaterizationAlert />
      <Box px={4} sx={{ flexGrow: 1, overflow: 'auto' }}>
        <SettleableAuctions />
        <RevenueAuctionList />
      </Box>
      <ConfirmAuction onClose={onClose} />
    </Sidebar>
  )
}

export default AuctionsSidebar
