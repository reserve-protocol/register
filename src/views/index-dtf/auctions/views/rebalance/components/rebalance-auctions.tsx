import DecimalDisplay from '@/components/decimal-display'
import TokenLogo from '@/components/token-logo'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import Spinner from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { getCurrentTime } from '@/utils'
import { useAtomValue } from 'jotai'
import { ArrowRight, ReceiptText, ScrollText } from 'lucide-react'
import { formatUnits } from 'viem'
import { Auction, rebalanceAuctionsAtom } from '../atoms'

const AuctionBids = ({ auction }: { auction: Auction }) => {
  const chainId = useAtomValue(chainIdAtom)

  if (auction.bids.length === 0) return null

  return (
    <div className="mb-4">
      <span className="text-sm text-legend">Bids ({auction.bids.length})</span>
      <div className="mt-2 space-y-2">
        {auction.bids.slice(0, 3).map((bid) => (
          <div
            key={bid.id}
            className="bg-background p-2 rounded-lg text-sm border border-border"
          >
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-1">
                <DecimalDisplay
                  className="text-destructive"
                  value={formatUnits(
                    BigInt(bid.sellAmount),
                    bid.sellToken.decimals
                  )}
                />
                <TokenLogo
                  chain={chainId}
                  address={bid.sellToken.address}
                  symbol={bid.sellToken.symbol}
                  className="ml-1"
                />
                {bid.sellToken.symbol}
              </div>
              <div className="p-1 bg-muted rounded-full">
                <ArrowRight size={12} />
              </div>
              <div className="flex items-center gap-1">
                <DecimalDisplay
                  className="text-green-500"
                  value={formatUnits(
                    BigInt(bid.buyAmount),
                    bid.buyToken.decimals
                  )}
                />
                <TokenLogo
                  chain={chainId}
                  address={bid.buyToken.address}
                  symbol={bid.buyToken.symbol}
                  className="ml-1"
                />
                {bid.buyToken.symbol}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-legend">
                {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
              </span>
            </div>
          </div>
        ))}
        {auction.bids.length > 3 && (
          <div className="text-center text-sm text-legend">
            +{auction.bids.length - 3} more bids
          </div>
        )}
      </div>
    </div>
  )
}

const AuctionItem = ({
  auction,
  index,
  totalAuctions,
}: {
  auction: Auction
  index: number
  totalAuctions: number
}) => {
  const isActive = +auction.endTime > getCurrentTime()

  return (
    <AccordionItem
      value={auction.id}
      className="border-b-0 bg-muted/30 shadow-md rounded-2xl px-4"
    >
      <AccordionTrigger>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded-full',
              isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}
          >
            {isActive ? <Spinner size={16} /> : <ReceiptText size={16} />}
          </div>
          <h4 className={cn(isActive && 'text-primary')}>
            Auction #{totalAuctions - index}
          </h4>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <span className="text-sm text-legend">Start Time</span>
            <div className="text-sm">
              {new Date(parseInt(auction.startTime) * 1000).toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-sm text-legend">End Time</span>
            <div className="text-sm">
              {new Date(parseInt(auction.endTime) * 1000).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <span className="text-sm text-legend">Tokens</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {auction.tokens.map((token, index) => (
              <div
                key={token.address}
                className="bg-background px-2 py-1 rounded-lg text-sm"
              >
                {token.symbol}
              </div>
            ))}
          </div>
        </div>

        <AuctionBids auction={auction} />
      </AccordionContent>
    </AccordionItem>
  )
}

const AuctionList = () => {
  const auctions = useAtomValue(rebalanceAuctionsAtom)

  return (
    <Accordion type="single" collapsible className="flex flex-col gap-4 mt-4">
      {auctions.map((auction, index) => (
        <AuctionItem
          key={auction.id}
          auction={auction}
          index={index}
          totalAuctions={auctions.length}
        />
      ))}
    </Accordion>
  )
}

const RebalanceAuctions = () => {
  const auctions = useAtomValue(rebalanceAuctionsAtom)

  if (auctions.length === 0) return null

  return (
    <div className="bg-background p-4 rounded-3xl">
      <div className="flex ">
        <div>
          <h4 className="text-primary flex items-center gap-1">
            <ScrollText className="w-4 h-4 text-primary" />
            Auctions
          </h4>
        </div>
      </div>
      <AuctionList />
    </div>
  )
}

export default RebalanceAuctions
