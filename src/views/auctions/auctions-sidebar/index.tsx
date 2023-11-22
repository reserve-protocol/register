import { Trans } from '@lingui/macro'
import { Button } from 'components'
import Sidebar from 'components/sidebar'
import { useAtom, useSetAtom } from 'jotai'
import { X } from 'react-feather'
import { Divider, Flex, Text } from 'theme-ui'
import { auctionSidebarAtom } from '../atoms'
import Revenue from './Revenue'

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
    <Sidebar
      onClose={toggleSidebar}
      width="600px"
      sx={{ backgroundColor: 'contentBackground' }}
    >
      <Header />
      <Divider mt={3} mb={0} mx={-4} />
      <Revenue />
    </Sidebar>
  )
}

export default AuctionsSidebar
