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
  amount: number
  bidder: string
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
  const { pastData, futureData, allData } = useMemo(() => {
    const points = 200
    const allData = []

    for (let i = 0; i <= points; i++) {
      const timeProgress = i / points
      const timestamp = startTime + (endTime - startTime) * timeProgress

      // Logarithmic decay curve - make sure it goes to near 0
      const price = 100 * Math.exp(-3.5 * timeProgress) // Steeper curve

      allData.push({
        timestamp,
        price: Math.max(price, 0.5), // Lower minimum to reach bottom
        isPast: timestamp <= currentTimeState,
      })
    }

    // Split data at current time
    const currentIndex = allData.findIndex(
      (point) => point.timestamp >= currentTimeState
    )
    const pastData = allData.slice(0, currentIndex + 1)
    const futureData = allData.slice(currentIndex)

    return { pastData, futureData, allData }
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
      <Card className="bg-gray-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 20, right: 40, left: 60, bottom: 60 }}>
                {/* Y-axis */}
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  axisLine={true}
                  tickLine={true}
                  tick={{ fontSize: 12, fill: '#666' }}
                  label={{
                    value: 'Price',
                    angle: -90,
                    position: 'insideLeft',
                    style: {
                      textAnchor: 'middle',
                      fontSize: '14px',
                      fill: '#333',
                    },
                  }}
                />

                {/* X-axis */}
                <XAxis
                  type="number"
                  dataKey="timestamp"
                  domain={[startTime, endTime]}
                  tickFormatter={formatTime}
                  axisLine={true}
                  tickLine={true}
                  tick={{ fontSize: 12, fill: '#666' }}
                  label={{
                    value: 'Time',
                    position: 'insideBottom',
                    offset: -10,
                    style: {
                      textAnchor: 'middle',
                      fontSize: '14px',
                      fill: '#333',
                    },
                  }}
                />

                {/* Past price line (blue) */}
                {pastData.length > 0 && (
                  <Line
                    data={pastData}
                    type="monotone"
                    dataKey="price"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                )}

                {/* Future price line (black) */}
                {futureData.length > 0 && (
                  <Line
                    data={futureData}
                    type="monotone"
                    dataKey="price"
                    stroke="#000000"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                )}

                {/* Optimal time reference line */}
                <ReferenceLine
                  x={optimalTime}
                  stroke="#2563eb"
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
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleBidClick(bid)}
                  />
                ))}

                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ strokeDasharray: '3 3' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

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
              <div>
                <p className="font-medium text-gray-600">Bidder</p>
                <p className="font-semibold">{selectedBid.bidder}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Price</p>
                <p className="font-semibold">{selectedBid.price.toFixed(1)}%</p>
              </div>
              <div>
                <p className="font-medium text-gray-600">Amount</p>
                <p className="font-semibold">{selectedBid.amount} ETH</p>
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
