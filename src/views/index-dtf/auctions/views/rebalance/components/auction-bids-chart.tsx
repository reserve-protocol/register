import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

interface Bid {
  id: string
  timestamp: number
  price: number
  amount: number // USD value
  bidder: string
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              Bid Information
              <div className="text-legend text-xs">#{selectedBid.id}</div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2">
                <p className="font-medium text-gray-600">Bidder</p>
                <p className="font-semibold text-xs">
                  {selectedBid.bidder.slice(0, 6)}...
                  {selectedBid.bidder.slice(-4)}
                </p>
              </div>
              {selectedBid.sellToken && selectedBid.buyToken && (
                <>
                  <div>
                    <p className="font-medium text-gray-600">Selling</p>
                    <p className="font-semibold">
                      {selectedBid.sellAmount?.toFixed(4)}{' '}
                      {selectedBid.sellToken.symbol}
                    </p>
                    {selectedBid.sellAmountUSD && (
                      <p className="text-xs text-muted-foreground">
                        ${selectedBid.sellAmountUSD.toFixed(2)} USD
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Buying</p>
                    <p className="font-semibold">
                      {selectedBid.buyAmount?.toFixed(4)}{' '}
                      {selectedBid.buyToken.symbol}
                    </p>
                    {selectedBid.buyAmountUSD && (
                      <p className="text-xs text-muted-foreground">
                        ${selectedBid.buyAmountUSD.toFixed(2)} USD
                      </p>
                    )}
                  </div>
                </>
              )}
              <div>
                <p className="font-medium text-gray-600">Exchange Rate</p>
                <p className="font-semibold">{selectedBid.price.toFixed(2)}%</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Time</p>
                <p className="font-semibold">
                  {formatTime(selectedBid.timestamp)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
