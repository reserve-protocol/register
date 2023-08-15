import { useAtom, useAtomValue } from 'jotai'
import { Box, Divider } from 'theme-ui'
import { TradeKind, auctionPlatformAtom } from './atoms'
import AuctionsSidebar from './auctions-sidebar'
import BatchAuctions from './batch'
import About from './components/About'
import AuctionsHeader from './components/AuctionsHeader'
import DutchAuctions from './dutch'
import { useEffect } from 'react'
import { isModuleLegacyAtom } from 'state/atoms'

const Auctions = () => {
  const [platform, setPlatform] = useAtom(auctionPlatformAtom)
  const { auctions: isLegacy } = useAtomValue(isModuleLegacyAtom)

  // Make sure platform = batch auctions for legacy tokens
  useEffect(() => {
    if (platform === TradeKind.DutchTrade && isLegacy) {
      setPlatform(TradeKind.BatchTrade)
    }
  }, [platform, isLegacy])

  return (
    <>
      <Box variant="layout.containerCompact">
        <AuctionsHeader />
        <Divider my={4} />
        {platform === TradeKind.BatchTrade ? (
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
