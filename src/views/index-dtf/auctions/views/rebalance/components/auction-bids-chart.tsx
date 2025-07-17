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

// Chart constants
const CHART_HEIGHT = 200
const CURVE_STEEPNESS = -3.5
const MIN_PRICE = 0.5
const MAX_PRICE = 100
const CHART_POINTS = 200
const UPDATE_INTERVAL = 1000 // 1 second
const CHART_MARGINS = { top: 0, right: 0, left: -32, bottom: 0 }

// UI constants
const TOKEN_LOGO_SIZE = 'w-6 h-6'
const ARROW_ICON_SIZE = 12
const ARROW_ICON_SIZE_SMALL = 10
const ARROW_DOWN_ICON_SIZE = 14

// Color constants
const COLORS = {
  PAST_PRICE: '#0151AF',
  FUTURE_PRICE: '#000000',
  BID_DOT: '#0151AF',
  BID_DOT_STROKE: '#ffffff',
}

// Utility functions
const formatAddress = (address: string): string =>
  `${address.slice(0, 6)}...${address.slice(-4)}`

const formatUsdAmount = (amount: number): string => `$${amount.toFixed(2)}`

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

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
  const [tick, setTick] = useState(0)
  const chainId = useAtomValue(chainIdAtom)

  // Always use real current time, clamped to auction bounds
  const currentTimeState = useMemo(() => {
    const realTime = Math.floor(Date.now() / 1000)
    // Ensure we're within auction time bounds
    if (realTime < startTime) return startTime
    if (realTime > endTime) return endTime
    return realTime
  }, [startTime, endTime, tick]) // tick forces recalculation

  // Update every second to trigger re-render
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1)
    }, UPDATE_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  // Generate logarithmic price curve data
  const chartData = useMemo(() => {
    const data = []

    for (let i = 0; i <= CHART_POINTS; i++) {
      const timeProgress = i / CHART_POINTS
      const timestamp = startTime + (endTime - startTime) * timeProgress

      // Logarithmic decay curve
      const price = MAX_PRICE * Math.exp(CURVE_STEEPNESS * timeProgress)

      data.push({
        timestamp,
        price: Math.max(price, MIN_PRICE), // Full curve in black
        pastPrice:
          timestamp <= currentTimeState ? Math.max(price, MIN_PRICE) : null, // Blue overlay
      })
    }

    return data
  }, [startTime, endTime, currentTimeState])

  // Process bids - position them exactly on the curve
  const bidData = useMemo(() => {
    return bids.map((bid) => {
      const timeProgress = (bid.timestamp - startTime) / (endTime - startTime)
      const curvePrice = MAX_PRICE * Math.exp(CURVE_STEEPNESS * timeProgress)

      return {
        ...bid,
        curvePrice: Math.max(curvePrice, MIN_PRICE),
      }
    })
  }, [bids, startTime, endTime])

  const chartConfig = {
    price: {
      label: 'Price',
      color: COLORS.FUTURE_PRICE,
    },
    pastPrice: {
      label: 'Past Price',
      color: COLORS.PAST_PRICE,
    },
    bids: {
      label: 'Bids',
      color: COLORS.BID_DOT,
    },
  }

  const handleBidClick = (bid: Bid) => {
    setSelectedBid(selectedBid?.id === bid.id ? null : bid)
  }

  return (
    <div className="w-full space-y-4">
      <ChartContainer
        config={chartConfig}
        className="w-full h-[200px] [&>div]:!w-full text-foreground"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={CHART_MARGINS}>
            {/* Y-axis */}
            <YAxis
              domain={[0, 100]}
              axisLine={{ stroke: 'currentColor' }}
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
                  fill: 'currentColor',
                },
              }}
            />

            {/* X-axis */}
            <XAxis
              type="number"
              dataKey="timestamp"
              domain={[startTime, endTime]}
              axisLine={{ stroke: 'currentColor' }}
              tickLine={false}
              tick={false}
              label={{
                value: 'Time',
                position: 'insideBottom',
                offset: 8,
                style: {
                  textAnchor: 'middle',
                  fontSize: '12px',
                  fill: 'currentColor',
                },
              }}
            />

            {/* Full price curve (black) - drawn first */}
            <Line
              type="monotone"
              dataKey="price"
              stroke={COLORS.FUTURE_PRICE}
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />

            {/* Past price overlay (blue) - drawn on top */}
            <Line
              type="monotone"
              dataKey="pastPrice"
              stroke={COLORS.PAST_PRICE}
              strokeWidth={2}
              dot={false}
              activeDot={false}
              connectNulls={false}
              isAnimationActive={false}
            />

            {/* Optimal time reference line */}
            <ReferenceLine
              x={optimalTime}
              stroke={COLORS.PAST_PRICE}
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
                fill={COLORS.BID_DOT}
                stroke={COLORS.BID_DOT_STROKE}
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
                {formatAddress(selectedBid.transactionHash)}
                <ArrowUpRight size={ARROW_ICON_SIZE} />
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
                  {formatAddress(selectedBid.bidder)}
                  <ArrowUpRight size={ARROW_ICON_SIZE} />
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
                      className={TOKEN_LOGO_SIZE}
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
                          <ArrowUpRight size={ARROW_ICON_SIZE_SMALL} />
                        </a>
                      </div>
                      {selectedBid.sellAmountUSD &&
                        selectedBid.sellAmountUSD > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {formatUsdAmount(selectedBid.sellAmountUSD)}
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center py-1">
                  <div className="p-1 bg-background rounded-full">
                    <ArrowDown
                      size={ARROW_DOWN_ICON_SIZE}
                      className="text-muted-foreground"
                    />
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
                      className={TOKEN_LOGO_SIZE}
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
                          <ArrowUpRight size={ARROW_ICON_SIZE_SMALL} />
                        </a>
                      </div>
                      {selectedBid.buyAmountUSD &&
                        selectedBid.buyAmountUSD > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {formatUsdAmount(selectedBid.buyAmountUSD)}
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
