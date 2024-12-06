import { Card } from '@/components/ui/card'
import LandingMint from './components/landing-mint'
import { Box } from '@/components/ui/box'
import { Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
} from 'recharts'
import PriceChart from './components/price-chart'

const chartData = [
  { month: 'January', desktop: 186 },
  { month: 'February', desktop: 305 },
  { month: 'March', desktop: 237 },
  { month: 'April', desktop: 73 },
  { month: 'May', desktop: 209 },
  { month: 'June', desktop: 214 },
]

const data = [
  { timestamp: 1, value: 280 },
  { timestamp: 2, value: 275 },
  { timestamp: 3, value: 285 },
  { timestamp: 4, value: 290 },
  { timestamp: 5, value: 288 },
  { timestamp: 6, value: 100 },
  { timestamp: 7, value: 295 },
  { timestamp: 8, value: 500 },
  { timestamp: 9, value: 287 },
  { timestamp: 10, value: 290 },
  { timestamp: 11, value: 295 },
  { timestamp: 12, value: 304.03 },
]

const timeRanges = [
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
  { label: '1M', value: '1m' },
  { label: '1Y', value: '1y' },
  { label: 'ALL', value: 'all' },
]

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--card))',
  },
} satisfies ChartConfig

const TokenDetails = () => {
  return (
    <Card className="p-6 h-96">
      <div className="flex">
        card title
        <Link>
          <Box variant="circle">
            <LinkIcon size={12} />
          </Box>
          Website
        </Link>
      </div>
    </Card>
  )
}

const Content = () => {
  return (
    <div className="rounded-2xl bg-secondary flex-1">
      <PriceChart />
      <div className="flex flex-col gap-1 m-1 -mt-20">
        <TokenDetails />
        <TokenDetails />

        <TokenDetails />
        <TokenDetails />
        <TokenDetails />
      </div>
    </div>
  )
}

const DTFOverview = () => {
  return (
    <div className="flex gap-2">
      <Content />
      <div>
        <div className="sticky top-0">
          <LandingMint className="hidden xl:block" />
        </div>
      </div>
    </div>
  )
}

export default DTFOverview
