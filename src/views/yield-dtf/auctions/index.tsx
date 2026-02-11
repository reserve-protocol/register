import { useAtomValue } from 'jotai'
import { Separator } from '@/components/ui/separator'
import { TradeKind, auctionPlatformAtom } from './atoms'
import AuctionsSidebar from './auctions-sidebar'
import BatchAuctions from './batch'
import About from './components/About'
import AuctionsHeader from './components/AuctionsHeader'
import DutchAuctions from './dutch'

const Auctions = () => {
  const platform = useAtomValue(auctionPlatformAtom)

  return (
    <div className="flex flex-col flex-grow p-0 md:p-6 relative">
      <AuctionsHeader />
      <Separator className="my-4" />
      {platform === TradeKind.BatchTrade ? (
        <BatchAuctions />
      ) : (
        <DutchAuctions />
      )}
      <Separator className="my-6" />
      <About />
      <AuctionsSidebar />
    </div>
  )
}

export default Auctions
