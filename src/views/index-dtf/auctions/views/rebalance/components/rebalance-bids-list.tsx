import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import TokenLogo from '@/components/token-logo'
import { chainIdAtom } from '@/state/atoms'
import { formatCurrency } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowDown, ArrowUpRight, ChevronsUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatUnits } from 'viem'
import { rebalanceAuctionsAtom } from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'

// Constants
const TOKEN_LOGO_SIZE = 'w-5 h-5'
const ARROW_ICON_SIZE = 10
const ARROW_DOWN_ICON_SIZE = 12

// Utility functions
const formatAddress = (address: string): string =>
  `${address.slice(0, 6)}...${address.slice(-4)}`

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    month: 'short',
    day: 'numeric'
  })
}

const formatTokenAmount = (amount: string, decimals: number): number =>
  parseFloat(formatUnits(BigInt(amount), decimals))

const getTokenPrice = (prices: any, tokenAddress: string): number =>
  prices?.[tokenAddress.toLowerCase()]?.currentPrice || 0

interface ProcessedBid {
  id: string
  bidder: string
  timestamp: number
  transactionHash: string
  sellToken: any
  buyToken: any
  sellAmount: number
  buyAmount: number
  sellAmountUSD: number
  buyAmountUSD: number
  auctionRound: number
  auctionId: string
}

const RebalanceBidsList = () => {
  const [isOpen, setIsOpen] = useState(false)
  const auctions = useAtomValue(rebalanceAuctionsAtom)
  const rebalanceParams = useRebalanceParams()
  const chainId = useAtomValue(chainIdAtom)

  // Aggregate and process all bids from all auctions
  const allBids = useMemo(() => {
    const bids: ProcessedBid[] = []

    auctions.forEach((auction, auctionIndex) => {
      auction.bids.forEach((bid) => {
        // Parse token amounts
        const sellAmount = formatTokenAmount(
          bid.sellAmount,
          bid.sellToken.decimals
        )
        const buyAmount = formatTokenAmount(
          bid.buyAmount,
          bid.buyToken.decimals
        )

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

        bids.push({
          id: bid.id,
          bidder: bid.bidder,
          timestamp: parseInt(bid.timestamp),
          transactionHash: bid.transactionHash,
          sellToken: bid.sellToken,
          buyToken: bid.buyToken,
          sellAmount,
          buyAmount,
          sellAmountUSD,
          buyAmountUSD,
          auctionRound: auctionIndex + 1,
          auctionId: auction.id,
        })
      })
    })

    // Sort by timestamp (newest first)
    return bids.sort((a, b) => b.timestamp - a.timestamp)
  }, [auctions, rebalanceParams])

  const totalBids = allBids.length

  if (totalBids === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-1 mt-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer hover:text-primary/80 transition-colors">
            <h4 className="text-primary text-xl">
              Bids ({totalBids})
            </h4>
            <ChevronsUpDown className="h-4 w-4 text-primary transition-transform duration-200 data-[state=open]:rotate-180" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 space-y-3">
            {allBids.map((bid, index) => (
              <div
                key={bid.id}
                className="bg-muted/50 rounded-xl p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-semibold">
                      Bid #{totalBids - index}
                    </h5>
                    <span className="text-xs text-muted-foreground">
                      Round {bid.auctionRound}
                    </span>
                  </div>
                  <a
                    href={getExplorerLink(
                      bid.transactionHash,
                      chainId,
                      ExplorerDataType.TRANSACTION
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {formatAddress(bid.transactionHash)}
                    <ArrowUpRight size={ARROW_ICON_SIZE} />
                  </a>
                </div>

                {/* Bidder and Time */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-muted-foreground">Bidder: </span>
                    <a
                      href={getExplorerLink(
                        bid.bidder,
                        chainId,
                        ExplorerDataType.ADDRESS
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {formatAddress(bid.bidder)}
                      <ArrowUpRight size={ARROW_ICON_SIZE} className="inline ml-0.5" />
                    </a>
                  </div>
                  <span className="text-muted-foreground">
                    {formatTime(bid.timestamp)}
                  </span>
                </div>

                {/* Token Exchange */}
                <div className="bg-background/50 rounded-lg p-3 flex items-center gap-3">
                  {/* Selling */}
                  <div className="flex items-center gap-2 flex-1">
                    <TokenLogo
                      chain={chainId}
                      address={bid.sellToken.address}
                      symbol={bid.sellToken.symbol}
                      className={TOKEN_LOGO_SIZE}
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {bid.sellAmount.toFixed(4)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {bid.sellToken.symbol}
                        </span>
                      </div>
                      {bid.sellAmountUSD > 0 && (
                        <p className="text-xs text-muted-foreground">
                          ${formatCurrency(bid.sellAmountUSD)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center">
                    <ArrowDown
                      size={ARROW_DOWN_ICON_SIZE}
                      className="text-muted-foreground rotate-[-90deg]"
                    />
                  </div>

                  {/* Buying */}
                  <div className="flex items-center gap-2 flex-1">
                    <TokenLogo
                      chain={chainId}
                      address={bid.buyToken.address}
                      symbol={bid.buyToken.symbol}
                      className={TOKEN_LOGO_SIZE}
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {bid.buyAmount.toFixed(4)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {bid.buyToken.symbol}
                        </span>
                      </div>
                      {bid.buyAmountUSD > 0 && (
                        <p className="text-xs text-muted-foreground">
                          ${formatCurrency(bid.buyAmountUSD)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default RebalanceBidsList
