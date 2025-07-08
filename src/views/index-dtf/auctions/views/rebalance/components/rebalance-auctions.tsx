import Spinner from '@/components/ui/spinner'
import useTimeRemaining from '@/hooks/use-time-remaining'
import { cn } from '@/lib/utils'
import { getCurrentTime } from '@/utils'
import { atom, useAtomValue } from 'jotai'
import { Clock } from 'lucide-react'
import { useMemo } from 'react'
import { formatUnits } from 'viem'
import { Auction, rebalanceAuctionsAtom } from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'
import AuctionBidsChart from './auction-bids-chart'

// Derived atom that returns the current active auction with its index or null
export const activeAuctionAtom = atom<{
  auction: Auction
  index: number
} | null>((get) => {
  const auctions = get(rebalanceAuctionsAtom)
  const currentTime = getCurrentTime()

  // MOCK: For testing - find an auction with more than 2 bids and make it active
  // If no auction with > 2 bids, take the first auction with any bids
  let auctionWithBidsIndex = auctions.findIndex(
    (auction) => auction.bids.length > 2
  )

  if (auctionWithBidsIndex === -1) {
    // Fallback: find any auction with bids
    auctionWithBidsIndex = auctions.findIndex(
      (auction) => auction.bids.length > 0
    )
  }

  // If still no auction with bids, just take the first auction
  if (auctionWithBidsIndex === -1 && auctions.length > 0) {
    auctionWithBidsIndex = 0
  }

  if (auctionWithBidsIndex !== -1) {
    const originalAuction = auctions[auctionWithBidsIndex]
    const mockAuction = {
      ...originalAuction,
      bids: [...originalAuction.bids], // Deep copy bids array
    }

    // Set auction to be active: started 20 minutes ago, ends in 10 minutes
    const mockStartTime = currentTime - 20 * 60 // 20 minutes ago
    const mockEndTime = currentTime + 10 * 60 // 10 minutes from now

    mockAuction.startTime = mockStartTime.toString()
    mockAuction.endTime = mockEndTime.toString()

    // Update bid timestamps to be within the auction time range
    if (mockAuction.bids.length > 0) {
      const auctionDuration = mockEndTime - mockStartTime
      mockAuction.bids = mockAuction.bids.map((bid, index) => ({
        ...bid,
        timestamp: Math.floor(
          mockStartTime +
            (auctionDuration * (index + 1)) / (mockAuction.bids.length + 1)
        ).toString(),
      }))
    }

    return {
      auction: mockAuction,
      index: auctionWithBidsIndex + 1,
    }
  }

  // Original logic - find actually active auction
  const activeAuctionIndex = auctions.findIndex(
    (auction) => parseInt(auction.endTime) > currentTime
  )

  if (activeAuctionIndex === -1) {
    return null
  }

  return {
    auction: auctions[activeAuctionIndex],
    index: activeAuctionIndex + 1, // 1-based index for display
  }
})

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
        transactionHash: bid.transactionHash,
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
  const activeAuctionData = useAtomValue(activeAuctionAtom)

  if (!activeAuctionData) {
    return null
  }

  return (
    <div className="bg-background p-2 rounded-3xl flex flex-col gap-2">
      <AuctionItem
        auction={activeAuctionData.auction}
        index={activeAuctionData.index - 1}
      />
    </div>
  )
}

export default RebalanceAuctions
