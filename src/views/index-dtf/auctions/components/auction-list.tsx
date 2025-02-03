import { Button } from '@/components/ui/button'
import { AssetTrade } from '../atoms'
import { Square } from 'lucide-react'
import AuctionItem from './auction-item'

const TradesHeader = () => {
  return (
    <div className="flex items-center">
      <h2 className="font-bold text-base ml-3 mr-auto">
        All Auctions in proposal
      </h2>
    </div>
  )
}

const AuctionList = ({ trades }: { trades: AssetTrade[] }) => (
  <div className="flex flex-col gap-2 bg-card p-2 md:p-4 rounded-3xl">
    <TradesHeader />
    {trades.map((trade) => (
      <AuctionItem key={trade.id} trade={trade} />
    ))}
  </div>
)

export default AuctionList
