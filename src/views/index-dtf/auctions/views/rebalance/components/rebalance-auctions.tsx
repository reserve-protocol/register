import Spinner from '@/components/ui/spinner'
import useTimeRemaining from '@/hooks/use-time-remaining'
import { cn } from '@/lib/utils'
import { getCurrentTime } from '@/utils'
import { useAtomValue } from 'jotai'
import { Clock } from 'lucide-react'
import { useMemo } from 'react'
import { formatUnits } from 'viem'
import { Auction, rebalanceAuctionsAtom } from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'
import AuctionBidsChart from './auction-bids-chart'

const AuctionBids = ({ auction }: { auction: Auction }) => {
  const rebalanceParams = useRebalanceParams()

  // Transform bid data for the chart
  const chartData = useMemo(() => {
    if (!auction.bids.length) {
      return {
        bids: [],
        startTime: parseInt(auction.startTime),
        endTime: parseInt(auction.endTime),
        optimalTime:
          parseInt(auction.startTime) +
          (parseInt(auction.endTime) - parseInt(auction.startTime)) / 2,
        currentTime: getCurrentTime(),
      }
    }

    const transformedBids = auction.bids.map((bid) => {
      // Calculate the effective exchange rate
      const sellAmount = parseFloat(
        formatUnits(BigInt(bid.sellAmount), bid.sellToken.decimals)
      )
      const buyAmount = parseFloat(
        formatUnits(BigInt(bid.buyAmount), bid.buyToken.decimals)
      )

      // Get USD prices for tokens - check if prices exist and use currentPrice
      const sellTokenData =
        rebalanceParams?.prices?.[bid.sellToken.address.toLowerCase()]
      const buyTokenData =
        rebalanceParams?.prices?.[bid.buyToken.address.toLowerCase()]

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
        buyAmountUSD,
      }
    })

    return {
      bids: transformedBids,
      startTime: parseInt(auction.startTime),
      endTime: parseInt(auction.endTime),
      optimalTime:
        parseInt(auction.startTime) +
        (parseInt(auction.endTime) - parseInt(auction.startTime)) / 2,
      currentTime: getCurrentTime(),
    }
  }, [auction, rebalanceParams])

  return (
    <div className="bg-muted/70 rounded-xl p-2 pt-4">
      <AuctionBidsChart
        startTime={chartData.startTime}
        endTime={chartData.endTime}
        optimalTime={chartData.optimalTime}
        currentTime={chartData.currentTime}
        bids={chartData.bids}
        title={`Auction ${auction.id}`}
        description="Live rebalance auction"
      />
    </div>
  )
}

const TimeRemaining = ({ auction }: { auction: Auction }) => {
  const timeRemaining = useTimeRemaining(+auction.endTime)

  if (!timeRemaining) return null

  return (
    <div className="ml-auto flex items-center bg-primary text-primary-foreground gap-1 p-2 rounded-full">
      <Clock className="w-4 h-4" />
      <span className="  text-xs ">{timeRemaining}</span>
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
  return (
    <div className="border-b-0 rounded-xl">
      <div className="flex items-center gap-2 p-4">
        <div
          className={cn(
            'h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground'
          )}
        >
          <Spinner size={16} />
        </div>
        <div className="text-left">
          <h4 className="text-primary">Auction {index + 1}</h4>
          <p className="text-legend font-normal text-xs">
            Bidding is ongoing...
          </p>
        </div>
        <TimeRemaining auction={auction} />
      </div>

      <AuctionBids auction={auction} />
    </div>
  )
}

const RebalanceAuctions = () => {
  const auctions = useAtomValue(rebalanceAuctionsAtom)

  if (auctions.length === 0) return null

  return (
    <div className="bg-background p-2 rounded-3xl flex flex-col gap-2">
      {auctions.map((auction, index) => (
        <AuctionItem key={auction.id} auction={auction} index={index} />
      ))}
    </div>
  )
}

export default RebalanceAuctions
