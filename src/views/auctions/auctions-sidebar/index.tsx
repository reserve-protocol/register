import { Trans } from '@lingui/macro'
import Sidebar from 'components/sidebar'
import { X } from 'react-feather'
import { Text, Flex, Button } from 'theme-ui'

const Header = ({ onClose }: { onClose(): void }) => {
  return (
    <Flex
      sx={{
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'border',
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
}

const AuctionsSidebar = ({ onClose }: { onClose(): void }) => {
  return (
    <Sidebar onClose={onClose} width="40vw">
      <Header onClose={onClose} />
    </Sidebar>
  )
}

export default AuctionsSidebar
