import { Trans } from '@lingui/macro'
import Sidebar from 'components/sidebar'
import { X } from 'react-feather'
import { Box, Button, Divider, Flex, Text } from 'theme-ui'
import ConfirmAuction from './ConfirmAuction'
import RevenueAuctionList from './RevenueAuctionList'
import RevenueOverview from './RevenueOverview'

const Header = ({ onClose }: { onClose(): void }) => (
  <Flex
    sx={{
      alignItems: 'center',
      height: '56px',
      flexShrink: 0,
    }}
    px={[3, 5]}
  >
    <Text variant="sectionTitle" sx={{ fontSize: 3 }} mr={1}>
      <Trans>Auctions</Trans>
    </Text>
    <Button variant="circle" ml="auto" onClick={onClose}>
      <X />
    </Button>
  </Flex>
)

const AuctionsSidebar = ({ onClose }: { onClose(): void }) => {
  return (
    <Sidebar onClose={onClose} width="40vw">
      <Header onClose={onClose} />
      <RevenueOverview />
      <Divider my={4} />
      <Box px={4} sx={{ flexGrow: 1, overflow: 'auto' }}>
        <RevenueAuctionList />
      </Box>
      <ConfirmAuction />
    </Sidebar>
  )
}

export default AuctionsSidebar
