import { ROUTES } from '@/utils/constants'
import { ArrowUpRightIcon, ScrollText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AssetTrade } from '../atoms'
import AuctionItem from './auction-item'

const TradesHeader = ({ proposalId }: { proposalId: string }) => {
  return (
    <div className="flex items-center">
      <h2 className="font-bold text-base  ml-3 ">
        All Auctions <span className="hidden md:inline-block">in proposal</span>
      </h2>
      <Link
        target="_blank"
        className="flex items-center gap-1 ml-auto text-sm mr-4"
        to={`../${ROUTES.GOVERNANCE_PROPOSAL}/${proposalId}`}
      >
        <div className="rounded-full p-1 border border-foreground">
          <ScrollText size={14} />
        </div>
        <span className="font-bold">View proposal</span>
        <div className="rounded-full p-1 bg-muted">
          <ArrowUpRightIcon size={14} />
        </div>
      </Link>
    </div>
  )
}

const AuctionList = ({
  trades,
  proposalId,
}: {
  trades: AssetTrade[]
  proposalId: string
}) => (
  <div className="flex flex-col gap-2 bg-card p-2 md:p-4 rounded-3xl">
    <TradesHeader proposalId={proposalId} />
    {trades.map((trade) => (
      <AuctionItem key={trade.id} trade={trade} />
    ))}
  </div>
)

export default AuctionList
