import { Trans } from '@lingui/macro'
import Sidebar from 'components/sidebar'
import { useAtom, useSetAtom } from 'jotai'
import { X } from 'react-feather'
import { Box, Button, Divider, Flex, Text } from 'theme-ui'
import { auctionSidebarAtom } from '../atoms'
import ConfirmAuction from './ConfirmAuction'
import RecollaterizationAlert from './RecollaterizationAlert'
import RevenueAuctionList from './RevenueAuctionList'
import RevenueOverview from './RevenueOverview'
import SettleableAuctions from './SettleableAuctions'

const Header = () => {
  const close = useSetAtom(auctionSidebarAtom)

  return (
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
      <Button variant="circle" ml="auto" onClick={close}>
        <X />
      </Button>
    </Flex>
  )
}

const AuctionsSidebar = () => {
  const [isOpen, toggleSidebar] = useAtom(auctionSidebarAtom)

  if (!isOpen) {
    return null
  }

  return (
    <Sidebar onClose={toggleSidebar} width="600px">
      <Header />
      <RevenueOverview />
      <Divider my={4} />
      <RecollaterizationAlert />
      <Box px={4} sx={{ flexGrow: 1, overflow: 'auto' }}>
        <SettleableAuctions />
        <RevenueAuctionList />
      </Box>
      <ConfirmAuction />
    </Sidebar>
  )
}

export default AuctionsSidebar
