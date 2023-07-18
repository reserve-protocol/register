import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Box, Divider } from 'theme-ui'
import {
  AuctionPlatform,
  auctionPlatformAtom,
  auctionSidebarAtom,
} from './atoms'
import AuctionsSidebar from './auctions-sidebar'
import About from './components/About'
import BatchAuctions from './batch'
import DutchAuctions from './dutch'
import { Button } from 'components'
import { Trans } from '@lingui/macro'

// TODO: When tokens upgrade to 3.0, default to dutch auctions
const Header = () => {
  const toggleSidebar = useSetAtom(auctionSidebarAtom)
  const [platform, setPlatform] = useAtom(auctionPlatformAtom)

  return (
    <Box variant="layout.verticalAlign">
      <Button small onClick={() => setPlatform(AuctionPlatform.Batch)}>
        <Trans>Batch auctions</Trans>
      </Button>
      <Button small onClick={() => setPlatform(AuctionPlatform.Dutch)}>
        <Trans>Dutch auctions</Trans>
      </Button>
    </Box>
  )
}

const Auctions = () => {
  const platform = useAtomValue(auctionPlatformAtom)

  return (
    <>
      <Box variant="layout.container">
        <Header />
        <Divider my={4} />
        {platform === AuctionPlatform.Batch ? (
          <BatchAuctions />
        ) : (
          <DutchAuctions />
        )}
        <Divider my={6} />
        <About />
      </Box>
      <AuctionsSidebar />
    </>
  )
}

export default Auctions
