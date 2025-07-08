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
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowRight, ArrowUpRight, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatUnits } from 'viem'
import { Auction, rebalanceAuctionsAtom } from '../atoms'
import AuctionBidsChart from './auction-bids-chart'
import useRebalanceParams from '../hooks/use-rebalance-params'
import { useMemo } from 'react'

const AuctionBids = ({ auction }: { auction: Auction }) => {
  const chainId = useAtomValue(chainIdAtom)
  const rebalanceParams = useRebalanceParams()

  // Transform bid data for the chart
  const chartData = useMemo(() => {
    if (!auction.bids.length) {
      return {
        bids: [],
        startTime: parseInt(auction.startTime),
        endTime: parseInt(auction.endTime),
        optimalTime: parseInt(auction.startTime) + (parseInt(auction.endTime) - parseInt(auction.startTime)) / 2,
        currentTime: getCurrentTime()
      }
    }

    const transformedBids = auction.bids.map((bid) => {
      // Calculate the effective exchange rate
      const sellAmount = parseFloat(formatUnits(BigInt(bid.sellAmount), bid.sellToken.decimals))
      const buyAmount = parseFloat(formatUnits(BigInt(bid.buyAmount), bid.buyToken.decimals))
      
      // Get USD prices for tokens - check if prices exist and use currentPrice
      const sellTokenData = rebalanceParams?.prices?.[bid.sellToken.address.toLowerCase()]
      const buyTokenData = rebalanceParams?.prices?.[bid.buyToken.address.toLowerCase()]
      
      const sellTokenPrice = sellTokenData?.currentPrice || 0
      const buyTokenPrice = buyTokenData?.currentPrice || 0
      
      // Calculate USD values
      const sellAmountUSD = sellAmount * sellTokenPrice
      const buyAmountUSD = buyAmount * buyTokenPrice
      
      // Calculate price as a percentage (0-100) - this is a simplified calculation
      // In a real implementation, you might want to use the auction's price limits
      const effectiveRate = buyAmount / sellAmount
      const price = Math.min(100, Math.max(0, effectiveRate * 10)) // Simplified price calculation
      
      return {
        id: bid.id,
        timestamp: parseInt(bid.timestamp),
        price,
        amount: sellAmountUSD, // Use USD value for amount
        bidder: bid.bidder,
        sellToken: bid.sellToken,
        buyToken: bid.buyToken,
        sellAmount,
        buyAmount,
        sellAmountUSD,
        buyAmountUSD
      }
    })

    return {
      bids: transformedBids,
      startTime: parseInt(auction.startTime),
      endTime: parseInt(auction.endTime),
      optimalTime: parseInt(auction.startTime) + (parseInt(auction.endTime) - parseInt(auction.startTime)) / 2,
      currentTime: getCurrentTime()
    }
  }, [auction, rebalanceParams])

  if (auction.bids.length === 0) return null

  return (
    <div>
      {chartData.bids.length > 0 && (
        <AuctionBidsChart
          startTime={chartData.startTime}
          endTime={chartData.endTime}
          optimalTime={chartData.optimalTime}
          currentTime={chartData.currentTime}
          bids={chartData.bids}
          title={`Auction ${auction.id}`}
          description="Live rebalance auction"
        />
      )}
      
      {/* Always show the bid list if there are bids */}
      {auction.bids.length > 0 && (
        <div className="mt-4">
          <span className="text-sm text-legend">Bids ({auction.bids.length})</span>
          <div className="mt-2 space-y-2">
            {auction.bids.map((bid) => {
              const sellTokenData = rebalanceParams?.prices?.[bid.sellToken.address.toLowerCase()]
              const buyTokenData = rebalanceParams?.prices?.[bid.buyToken.address.toLowerCase()]
              const sellTokenPrice = sellTokenData?.currentPrice || 0
              const buyTokenPrice = buyTokenData?.currentPrice || 0
              const sellAmount = parseFloat(formatUnits(BigInt(bid.sellAmount), bid.sellToken.decimals))
              const buyAmount = parseFloat(formatUnits(BigInt(bid.buyAmount), bid.buyToken.decimals))
              
              return (
                <div
                  key={bid.id}
                  className="bg-background p-2 rounded-lg text-sm border border-border"
                >
                  <div className="flex gap-2 items-center justify-between">
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
                      {sellTokenPrice > 0 && (
                        <span className="text-xs text-muted-foreground">
                          (${(sellAmount * sellTokenPrice).toFixed(2)})
                        </span>
                      )}
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
                      {buyTokenPrice > 0 && (
                        <span className="text-xs text-muted-foreground">
                          (${(buyAmount * buyTokenPrice).toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Link
                      to={getExplorerLink(
                        bid.transactionHash,
                        chainId,
                        ExplorerDataType.TRANSACTION
                      )}
                      className="flex items-center gap-1 text-legend"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const AuctionItem = ({
  auction,
  index,
}: {
  auction: Auction
  index: number
}) => {
  const isActive = +auction.endTime > getCurrentTime()

  return (
    <AccordionItem
      value={auction.id}
      className="border-b-0 bg-muted rounded-xl px-4"
    >
      <AccordionTrigger>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'h-8 w-8 flex items-center justify-center rounded-full border border-primary',
              isActive ? 'text-primary' : 'bg-primary text-primary-foreground'
            )}
          >
            {isActive ? <Spinner size={16} /> : <ReceiptText size={16} />}
          </div>
          <div className="text-left">
            <h4 className="text-primary">Auction {index + 1}</h4>
            <p className="text-legend font-normal text-xs">
              {isActive ? 'Bidding is ongoing...' : 'Executed N trades'}
            </p>
          </div>
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

const RebalanceAuctions = () => {
  const auctions = useAtomValue(rebalanceAuctionsAtom)

  if (auctions.length === 0) return null

  return (
    <div className="bg-background p-2 rounded-3xl">
      <Accordion type="single" collapsible className="flex flex-col gap-2">
        {auctions.map((auction, index) => (
          <AuctionItem key={auction.id} auction={auction} index={index} />
        ))}
      </Accordion>
    </div>
  )
}

export default RebalanceAuctions