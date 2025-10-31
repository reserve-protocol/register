import CoverPlaceholder from '@/components/icons/cover-placeholder'
import InfoBox from '@/components/old/info-box'
import TokenLogo from '@/components/token-logo'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { cn } from '@/lib/utils'
import { wagmiConfig } from '@/state/chain'
import {
  formatCurrency,
  formatToSignificantDigits,
  getFolioRoute,
} from '@/utils'
import { AvailableChain } from '@/utils/chains'
import { RESERVE_API } from '@/utils/constants'
import ZapperWrapper from '@/views/index-dtf/components/zapper/zapper-wrapper'
import useIndexDTFPriceHistory from '@/views/index-dtf/overview/hooks/use-dtf-price-history'
import dayjs from 'dayjs'
import { Provider } from 'jotai'
import { ArrowRight, Fingerprint, Gem, Tags } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Line, LineChart, Tooltip, TooltipProps, YAxis } from 'recharts'
import { Card } from 'theme-ui'

const DTFCover = ({ cover }: { cover: string | undefined }) => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (cover) {
      setIsLoading(true)
      const img = new Image()
      img.onload = () => setIsLoading(false)
      img.onerror = () => setIsLoading(false)
      img.src = cover
    } else {
      setIsLoading(false)
    }
  }, [cover])

  if (isLoading) {
    return <Skeleton className="w-full aspect-square rounded-3xl" />
  }

  if (cover) {
    return (
      <img
        className="object-cover w-full aspect-square rounded-3xl"
        alt="DTF"
        src={cover}
      />
    )
  }

  return (
    <div className="w-full aspect-square rounded-3xl flex items-center justify-center bg-card">
      <CoverPlaceholder className="text-legend w-3/4 h-3/4" />
    </div>
  )
}

const DTFLeftCard = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div
      className="dtf-left-card flex flex-col gap-2 h-full border-r p-2"
      style={{ minHeight: '693px' }}
    >
      <div className="dtf-cover-container flex-1 flex items-center justify-center">
        <DTFCover cover={dtf.brand?.cover} />
      </div>

      <Provider>
        <div
          className="zapper-container bg-card rounded-3xl"
          style={{ height: '306px' }}
        >
          <ZapperWrapper
            wagmiConfig={wagmiConfig}
            chain={dtf.chainId as AvailableChain}
            dtfAddress={dtf.address}
            mode="simple"
            apiUrl={RESERVE_API}
          />
        </div>
      </Provider>
    </div>
  )
}

const DTFBasket = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div
      className="dtf-basket-section bg-primary/10 p-6"
      style={{ minHeight: '693px' }}
    >
      <div className="basket-header flex items-center mb-8">
        <Gem size={24} strokeWidth={1} />
        <div className="flex items-center text-legend ml-auto text-xs gap-1">
          <Tags size={16} />
          <span>
            {dtf.brand?.tags?.length ? dtf.brand.tags.join(', ') : 'None'}
          </span>
        </div>
      </div>
      <h4 className="mb-4 font-semibold">What's in the {dtf.symbol} Index?</h4>
      <div className="token-list flex flex-col gap-3 max-h-[400px] overflow-y-auto">
        {dtf.basket.slice(0, 8).map((token) => (
          <div key={token.address} className="flex gap-2 items-center text-sm">
            <TokenLogo
              address={token.address}
              chain={dtf.chainId}
              symbol={token.symbol}
              size="xl"
            />
            <span className="mr-auto">
              {token.name} ({token.symbol})
            </span>
            <span>{token.weight}%</span>
          </div>
        ))}
        {dtf.basket.length > 8 && (
          <div className="text-xs text-muted-foreground text-center pt-2">
            +{dtf.basket.length - 8} more
          </div>
        )}
      </div>
    </div>
  )
}

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--card))',
  },
} satisfies ChartConfig

const timeRangeOptions = [
  { label: '1d', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '1m', value: '1m' },
  { label: '3m', value: '3m' },
  { label: 'All', value: 'all' },
] as const

type TimeRange = '24h' | '7d' | '1m' | '3m' | 'all'

// Custom Tooltip Component
function CustomTooltip({
  payload,
  active,
}: {
  payload?: TooltipProps<number, string>['payload']
  active?: boolean
}) {
  if (active && payload && payload.length > 0) {
    const data = payload[0]?.payload
    const subtitle = dayjs.unix(+data?.timestamp).format('YYYY-M-D HH:mm')
    const value = data?.value
    const formattedValue = formatToSignificantDigits(value)

    return (
      <Card backgroundColor="cardBackground">
        <InfoBox title={'$' + formattedValue} subtitle={subtitle} />
      </Card>
    )
  }

  return null
}

// Time range configurations
const now = Math.floor(Date.now() / 1_000)
const currentHour = Math.floor(now / 3_600) * 3_600

const historicalConfigs: Record<
  TimeRange,
  { to: number; from: number; interval: '1h' | '1d' }
> = {
  '24h': { to: currentHour, from: currentHour - 86_400, interval: '1h' },
  '7d': { to: currentHour, from: currentHour - 604_800, interval: '1h' },
  '1m': { to: currentHour, from: currentHour - 2_592_000, interval: '1h' },
  '3m': { to: currentHour, from: currentHour - 7_776_000, interval: '1d' },
  all: { to: currentHour, from: 0, interval: '1d' },
}

interface PerformanceChartProps {
  dtf: IndexDTFItem
  onRangeChange: (range: TimeRange, performanceData: any) => void
}

const PerformanceChart = ({ dtf, onRangeChange }: PerformanceChartProps) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d')

  // Get config for selected range
  const config = useMemo(() => {
    if (selectedRange === 'all') {
      // For 'all' range, start from a reasonable default if dtf doesn't have timestamp
      return {
        to: currentHour,
        from: currentHour - 31_536_000, // Default to 1 year if no timestamp
        interval: '1d' as const,
      }
    }
    return historicalConfigs[selectedRange]
  }, [selectedRange])

  // Fetch price history
  const { data: history, isLoading } = useIndexDTFPriceHistory({
    address: dtf.address,
    chainId: dtf.chainId,
    currentPrice: dtf.price,
    totalSupply: undefined, // Not needed for chart display
    ...config,
  })

  // Filter and prepare chart data
  const chartData = useMemo(() => {
    if (!history?.timeseries) return dtf.performance // Fallback to existing data
    return history.timeseries
      .filter(({ price }) => Boolean(price))
      .map((item) => ({ timestamp: item.timestamp, value: item.price }))
  }, [history?.timeseries, dtf.performance])

  // Calculate performance metrics and notify parent
  useEffect(() => {
    if (history?.timeseries && history.timeseries.length > 0) {
      const timeseries = history.timeseries.filter(({ price }) =>
        Boolean(price)
      )
      if (timeseries.length > 0) {
        const firstValue = timeseries[0].price
        const lastValue = timeseries[timeseries.length - 1].price
        const percentageChange =
          firstValue === 0 ? 0 : ((lastValue - firstValue) / firstValue) * 100
        const priceChange = lastValue - firstValue

        onRangeChange(selectedRange, {
          percentageChange,
          priceChange,
          range: selectedRange,
        })
      }
    }
  }, [history?.timeseries, selectedRange, onRangeChange])

  const handleRangeClick = (range: TimeRange) => {
    setSelectedRange(range)
  }

  return (
    <div className="p-6">
      <ChartContainer config={chartConfig} className="h-36 w-full">
        {isLoading ? (
          <Skeleton className="h-36 w-full" />
        ) : (
          <LineChart data={chartData}>
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="currentColor"
              strokeWidth={1}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        )}
      </ChartContainer>
      <div className="flex items-center justify-between w-full mt-4">
        {timeRangeOptions.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleRangeClick(value)}
            className={cn(
              'text-legend transition-colors',
              selectedRange === value && 'text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

const About = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div className="p-6">
      <h4 className="text-xl">About {dtf.symbol}</h4>
      <p className="my-4 text-legend">description</p>
      <Link
        to={getFolioRoute(dtf.address, dtf.chainId)}
        className="text-primary flex items-center gap-1"
      >
        <Fingerprint size={16} />
        <span>Learn more about {dtf.symbol}</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  )
}

interface DTFInfoProps {
  dtf: IndexDTFItem
}

const DTFInfo = ({ dtf }: DTFInfoProps) => {
  const [performanceData, setPerformanceData] = useState<{
    percentageChange: number
    priceChange: number
    range: TimeRange
  }>({
    percentageChange: 0,
    priceChange: 0,
    range: '7d',
  })

  // Format the time period label
  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case '24h':
        return 'Past day'
      case '7d':
        return 'Past week'
      case '1m':
        return 'Past month'
      case '3m':
        return 'Past 3 months'
      case 'all':
        return 'All time'
      default:
        return 'Past week'
    }
  }

  const handlePerformanceChange = useCallback((range: TimeRange, data: any) => {
    setPerformanceData(data)
  }, [])

  // Format the performance display
  const formatPerformance = () => {
    const { percentageChange, priceChange } = performanceData
    const sign = percentageChange >= 0 ? '+' : ''
    const priceSign = priceChange >= 0 ? '+' : '-'

    return (
      <span
        className={cn(
          'text-sm block',
          percentageChange >= 0 ? 'text-primary' : 'text-destructive'
        )}
      >
        {sign}
        {percentageChange.toFixed(2)}% ({priceSign}$
        {Math.abs(priceChange).toFixed(2)}){' '}
        {getTimeRangeLabel(performanceData.range)}
      </span>
    )
  }

  return (
    <div
      className="dtf-info-section h-full w-full"
      style={{ minHeight: '693px' }}
    >
      <div className="logo-section flex items-center flex-shrink-0 p-6 pb-4">
        <TokenLogo
          src={dtf?.brand?.icon || undefined}
          size="xl"
          alt={dtf?.symbol ?? 'dtf token logo'}
        />
      </div>
      <div className="title-section px-6">
        <h4 className="text-2xl">{dtf.name}</h4>
        <h4 className="text-2xl mb-1">${formatCurrency(dtf.price)}</h4>
        {formatPerformance()}
      </div>

      <PerformanceChart dtf={dtf} onRangeChange={handlePerformanceChange} />
      <div className="market-cap-section flex items-center text-lg p-6 border-y ">
        <span className="mr-auto">Market Cap</span>
        <span>${formatCurrency(dtf.marketCap)}</span>
      </div>
      <div className="about-section">
        <About dtf={dtf} />
      </div>
    </div>
  )
}

const DTFHomeCardFixed = ({ dtf }: { dtf: IndexDTFItem }) => {
  return (
    <div
      className="w-full rounded-4xl max-w-[1400px] mx-auto bg-card border border-primary-foreground"
      style={{ minHeight: '695px' }}
    >
      <div
        className="grid lg:grid-cols-[320px_1fr_1fr] xl:grid-cols-[380px_1fr_1fr] gap-0"
        style={{ minHeight: '693px' }}
      >
        <DTFLeftCard dtf={dtf} />
        <DTFInfo dtf={dtf} />
        <DTFBasket dtf={dtf} />
      </div>
    </div>
  )
}

export default DTFHomeCardFixed
