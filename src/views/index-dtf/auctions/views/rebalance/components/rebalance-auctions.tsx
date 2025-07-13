import Spinner from '@/components/ui/spinner'
import useTimeRemaining from '@/hooks/use-time-remaining'
import { cn } from '@/lib/utils'
import { getCurrentTime } from '@/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { Clock } from 'lucide-react'
import { useMemo, useEffect, useState } from 'react'
import { formatUnits } from 'viem'
import { Auction, activeAuctionAtom, refreshNonceAtom } from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'
import AuctionBidsChart from './auction-bids-chart'

// Constants
const SPINNER_SIZE = 16
const CLOCK_ICON_SIZE = 4

// Helper functions
const formatTokenAmount = (amount: string, decimals: number): number =>
  parseFloat(formatUnits(BigInt(amount), decimals))

const getTokenPrice = (prices: any, tokenAddress: string): number =>
  prices?.[tokenAddress.toLowerCase()]?.currentPrice || 0

const calculateOptimalTime = (startTime: number, endTime: number): number =>
  startTime + (endTime - startTime) / 2

const AuctionBids = ({ auction }: { auction: Auction }) => {
  const rebalanceParams = useRebalanceParams()

  const chartData = useMemo(() => {
    const startTime = parseInt(auction.startTime)
    const endTime = parseInt(auction.endTime)

    if (!auction.bids.length) {
      return {
        bids: [],
        startTime,
        endTime,
        optimalTime: calculateOptimalTime(startTime, endTime),
        currentTime: getCurrentTime(),
      }
    }

    const transformedBids = auction.bids.map((bid) => {
      // Parse token amounts
      const sellAmount = formatTokenAmount(
        bid.sellAmount,
        bid.sellToken.decimals
      )
      const buyAmount = formatTokenAmount(bid.buyAmount, bid.buyToken.decimals)

      // Get USD prices
      const sellTokenPrice = getTokenPrice(
        rebalanceParams?.prices,
        bid.sellToken.address
      )
      const buyTokenPrice = getTokenPrice(
        rebalanceParams?.prices,
        bid.buyToken.address
      )

      // Calculate USD values
      const sellAmountUSD = sellAmount * sellTokenPrice
      const buyAmountUSD = buyAmount * buyTokenPrice

      // Calculate exchange rate as percentage
      const exchangeRate = buyAmount / sellAmount
      const price = Math.min(100, Math.max(0, exchangeRate * 10))

      return {
        id: bid.id,
        timestamp: parseInt(bid.timestamp),
        price,
        amount: sellAmountUSD,
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
      startTime,
      endTime,
      optimalTime: calculateOptimalTime(startTime, endTime),
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
      <Clock className={`w-${CLOCK_ICON_SIZE} h-${CLOCK_ICON_SIZE}`} />
      <span className="text-xs">{timeRemaining}</span>
    </div>
  )
}

// Component that monitors auction end and triggers refresh
const AuctionEndMonitor = ({ endTime }: { endTime: string }) => {
  const setRefreshNonce = useSetAtom(refreshNonceAtom)

  useEffect(() => {
    const checkAuctionEnd = () => {
      const currentTime = Math.floor(Date.now() / 1000)
      const auctionEndTime = parseInt(endTime)
      
      if (currentTime > auctionEndTime) {
        // Increment nonce to trigger data refresh
        setRefreshNonce((prev) => prev + 1)
      }
    }

    // Check every second
    const interval = setInterval(checkAuctionEnd, 1000)

    return () => clearInterval(interval)
  }, [endTime, setRefreshNonce])

  return null
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
        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Spinner size={SPINNER_SIZE} />
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
      <AuctionEndMonitor endTime={activeAuctionData.auction.endTime} />
      <AuctionItem
        auction={activeAuctionData.auction}
        index={activeAuctionData.index - 1}
      />
    </div>
  )
}

export default RebalanceAuctions
