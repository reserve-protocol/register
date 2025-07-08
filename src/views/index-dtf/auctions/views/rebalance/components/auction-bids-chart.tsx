import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useEffect, useMemo, useState } from 'react'
import {
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import TokenLogo from '@/components/token-logo'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from '@/state/atoms'

interface Bid {
  id: string
  timestamp: number
  price: number
  amount: number // USD value
  bidder: string
  transactionHash?: string
  sellToken?: {
    address: string
    symbol: string
    decimals: number
  }
  buyToken?: {
    address: string
    symbol: string
    decimals: number
  }
  sellAmount?: number
  buyAmount?: number
  sellAmountUSD?: number
  buyAmountUSD?: number
}

interface AuctionBidsChartProps {
  startTime: number
  endTime: number
  optimalTime: number
  currentTime: number
  bids: Bid[]
  title?: string
  description?: string
}

export default function AuctionBidsChart({
  startTime,
  endTime,
  optimalTime,
  currentTime,
  bids,
  title = 'Dutch Auction',
  description = 'Price vs Time',
}: AuctionBidsChartProps) {
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)
  const [currentTimeState, setCurrentTimeState] = useState(currentTime)
  const chainId = useAtomValue(chainIdAtom)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeState((prev) => {
        const newTime = prev + 60 // Add 60 seconds (1 minute)
        return newTime <= endTime ? newTime : endTime // Don't go past endTime
      })
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [endTime])

  // Generate logarithmic price curve data
  const chartData = useMemo(() => {
    const points = 200
    const data = []

    for (let i = 0; i <= points; i++) {
      const timeProgress = i / points
      const timestamp = startTime + (endTime - startTime) * timeProgress

      // Logarithmic decay curve - make sure it goes to near 0
      const price = 100 * Math.exp(-3.5 * timeProgress) // Steeper curve

      data.push({
        timestamp,
        price: Math.max(price, 0.5), // Lower minimum to reach bottom
        pastPrice: timestamp <= currentTimeState ? Math.max(price, 0.5) : null,
        futurePrice:
          timestamp >= currentTimeState ? Math.max(price, 0.5) : null,
      })
    }

    return data
  }, [startTime, endTime, currentTimeState])

  // Process bids - position them exactly on the curve
  const bidData = useMemo(() => {
    return bids.map((bid) => {
      const timeProgress = (bid.timestamp - startTime) / (endTime - startTime)
      const curvePrice = 100 * Math.exp(-3.5 * timeProgress)

      return {
        ...bid,
        curvePrice: Math.max(curvePrice, 0.5),
      }
    })
  }, [bids, startTime, endTime])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const chartConfig = {
    pastPrice: {
      label: 'Past Price',
      color: '#2563eb', // Blue
    },
    futurePrice: {
      label: 'Future Price',
      color: '#000000', // Black
    },
    bids: {
      label: 'Bids',
      color: '#2563eb', // Blue for bid dots
    },
  }

  const handleBidClick = (bid: Bid) => {
    setSelectedBid(selectedBid?.id === bid.id ? null : bid)
  }

  return (
    <div className="w-full space-y-4">
      <ChartContainer
        config={chartConfig}
        className="w-full h-[200px] [&>div]:!w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 0, right: 0, left: -32, bottom: 0 }}
          >
            {/* Y-axis */}
            <YAxis
              domain={[0, 100]}
              axisLine={true}
              tickLine={false}
              tick={false}
              label={{
                value: 'Price',
                angle: -90,
                position: 'insideLeft',
                offset: 42,
                style: {
                  textAnchor: 'middle',
                  fontSize: '12px',
                  fill: '#333',
                },
              }}
            />

            {/* X-axis */}
            <XAxis
              type="number"
              dataKey="timestamp"
              domain={[startTime, endTime]}
              axisLine={true}
              tickLine={false}
              tick={false}
              label={{
                value: 'Time',
                position: 'insideBottom',
                offset: 8,
                style: {
                  textAnchor: 'middle',
                  fontSize: '12px',
                  fill: '#333',
                },
              }}
            />

            {/* Past price line (blue) */}
            <Line
              type="monotone"
              dataKey="pastPrice"
              stroke="#0151AF"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              connectNulls={true}
              isAnimationActive={false}
            />

            {/* Future price line (black) */}
            <Line
              type="monotone"
              dataKey="futurePrice"
              stroke="#000000"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              connectNulls={true}
              isAnimationActive={false}
            />

            {/* Optimal time reference line */}
            <ReferenceLine
              x={optimalTime}
              stroke="#0151AF"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            {/* Bid dots using ReferenceDot */}
            {bidData.map((bid) => (
              <ReferenceDot
                key={bid.id}
                x={bid.timestamp}
                y={bid.curvePrice}
                r={4}
                fill="#0151AF"
                stroke="#ffffff"
                strokeWidth={2}
                style={{ cursor: 'pointer' }}
                onClick={() => handleBidClick(bid)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Selected bid information */}
      {selectedBid && (
        <div className="bg-background rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base text-primary font-semibold">
              Bid #{bids.findIndex((b) => b.id === selectedBid.id) + 1}
            </h3>
            {selectedBid.transactionHash && (
              <a
                href={getExplorerLink(
                  selectedBid.transactionHash,
                  chainId,
                  ExplorerDataType.TRANSACTION
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {selectedBid.transactionHash.slice(0, 6)}...
                {selectedBid.transactionHash.slice(-4)}
                <ArrowUpRight size={12} />
              </a>
            )}
          </div>

          <div className="space-y-3">
            {/* Bidder and Time on same line */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Bidder</p>
                <a
                  href={getExplorerLink(
                    selectedBid.bidder,
                    chainId,
                    ExplorerDataType.ADDRESS
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                >
                  {selectedBid.bidder.slice(0, 6)}...
                  {selectedBid.bidder.slice(-4)}
                  <ArrowUpRight size={12} />
                </a>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Time</p>
                <p className="text-sm">{formatTime(selectedBid.timestamp)}</p>
              </div>
            </div>

            {/* Token Exchange */}
            {selectedBid.sellToken && selectedBid.buyToken && (
              <div className="bg-muted/50 rounded-xl p-3 space-y-2">
                {/* Selling */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Selling</p>
                  <div className="flex items-center gap-2">
                    <TokenLogo
                      chain={chainId}
                      address={selectedBid.sellToken.address}
                      symbol={selectedBid.sellToken.symbol}
                      className="w-6 h-6"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {selectedBid.sellAmount?.toFixed(4)}
                        </span>
                        <a
                          href={getExplorerLink(
                            selectedBid.sellToken.address,
                            chainId,
                            ExplorerDataType.TOKEN
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-legend hover:text-primary transition-colors flex items-center gap-0.5"
                        >
                          {selectedBid.sellToken.symbol}
                          <ArrowUpRight size={10} />
                        </a>
                      </div>
                      {selectedBid.sellAmountUSD &&
                        selectedBid.sellAmountUSD > 0 && (
                          <p className="text-xs text-muted-foreground">
                            ${selectedBid.sellAmountUSD.toFixed(2)}
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center py-1">
                  <div className="p-1 bg-background rounded-full">
                    <ArrowDown size={14} className="text-muted-foreground" />
                  </div>
                </div>

                {/* Buying */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Buying</p>
                  <div className="flex items-center gap-2">
                    <TokenLogo
                      chain={chainId}
                      address={selectedBid.buyToken.address}
                      symbol={selectedBid.buyToken.symbol}
                      className="w-6 h-6"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {selectedBid.buyAmount?.toFixed(4)}
                        </span>
                        <a
                          href={getExplorerLink(
                            selectedBid.buyToken.address,
                            chainId,
                            ExplorerDataType.TOKEN
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-legend hover:text-primary transition-colors flex items-center gap-0.5"
                        >
                          {selectedBid.buyToken.symbol}
                          <ArrowUpRight size={10} />
                        </a>
                      </div>
                      {selectedBid.buyAmountUSD &&
                        selectedBid.buyAmountUSD > 0 && (
                          <p className="text-xs text-muted-foreground">
                            ${selectedBid.buyAmountUSD.toFixed(2)}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
