import { useAtomValue } from 'jotai'
import { Box, Divider } from 'theme-ui'
import { TradeKind, auctionPlatformAtom } from './atoms'
import AuctionsSidebar from './auctions-sidebar'
import BatchAuctions from './batch'
import About from './components/About'
import AuctionsHeader from './components/AuctionsHeader'
import DutchAuctions from './dutch'
import { useEffect } from 'react'

const Auctions = () => {
  const platform = useAtomValue(auctionPlatformAtom)

  return (
    <Box variant="layout.tokenView">
      <AuctionsHeader />
      <Divider my={4} />
      {platform === TradeKind.BatchTrade ? (
        <BatchAuctions />
      ) : (
        <DutchAuctions />
      )}
      <Divider my={6} />
      <About />
      <AuctionsSidebar />
    </Box>
  )
}

export default Auctions
