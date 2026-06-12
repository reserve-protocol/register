import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { SorteableButton } from '@/components/ui/data-table'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { cn } from '@/lib/utils'
import { formatCurrency, getFolioRoute } from '@/utils'
import { RESERVE_API } from '@/utils/constants'
import { ColumnDef } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { useId } from 'react'
import { Link } from 'react-router-dom'
import { Line, LineChart, YAxis } from 'recharts'
import { BasketHoverCard } from './basket-hover-card'
import { calculatePercentageChange } from './utils'

export const LIMIT_ASSETS = 4
const HOVER_LIMIT_ASSETS = 10
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60
const REFRESH_INTERVAL = 1000 * 60 * 30

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--card))',
  },
} satisfies ChartConfig

const TableHeader = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => <div className={cn('text-legend', className)}>{children}</div>

const exposureTriggerClassName =
  'inline-flex items-center gap-1 rounded-full border border-transparent p-1.5 transition-[border-color,background-color,opacity] duration-150 group-hover/dtf-row:border-secondary group-hover/dtf-row:bg-card'

const withChainId = (
  assets: IndexDTFItem['basket'],
  chainId: IndexDTFItem['chainId']
) => assets.map((asset) => ({ ...asset, chain: chainId }))

const getSparklineValueDomain = ([dataMin, dataMax]: [number, number]): [
  number,
  number,
] => {
  if (!Number.isFinite(dataMin) || !Number.isFinite(dataMax)) {
    return [dataMin, dataMax]
  }

  if (dataMin === dataMax) {
    const padding = Math.max(Math.abs(dataMin) * 0.01, 0.01)
    return [dataMin - padding, dataMax + padding]
  }

  const padding = (dataMax - dataMin) * 0.08
  return [dataMin - padding, dataMax + padding]
}

const getPerformanceDirection = (
  performance: IndexDTFItem['performance']
): 'positive' | 'negative' | 'neutral' => {
  if (performance.length < 2) return 'neutral'

  const firstValue = performance[0].value
  const lastValue = performance[performance.length - 1].value

  if (lastValue > firstValue) return 'positive'
  if (lastValue < firstValue) return 'negative'
  return 'neutral'
}

const useDetailedSevenDayPerformance = (dtf: IndexDTFItem) => {
  return useQuery({
    queryKey: ['discover-dtf-7d-performance', dtf.chainId, dtf.address],
    queryFn: async (): Promise<IndexDTFItem['performance']> => {
      const to = Math.floor(Date.now() / 3_600_000) * 3_600
      const from = to - SEVEN_DAYS_SECONDS
      const sp = new URLSearchParams()
      sp.set('chainId', dtf.chainId.toString())
      sp.set('address', dtf.address.toLowerCase())
      sp.set('from', from.toString())
      sp.set('to', to.toString())
      sp.set('interval', '1h')

      const response = await fetch(`${RESERVE_API}historical/dtf?${sp}`)

      if (!response.ok) {
        throw new Error('Failed to fetch DTF performance')
      }

      const data = (await response.json()) as {
        timeseries?: { timestamp: number; price: number }[]
      }

      return (data.timeseries ?? [])
        .filter(({ price }) => Boolean(price))
        .map(({ timestamp, price }) => ({ timestamp, value: price }))
    },
    staleTime: REFRESH_INTERVAL,
    refetchInterval: REFRESH_INTERVAL,
  })
}

const PerformanceCell = ({ dtf }: { dtf: IndexDTFItem }) => {
  const fallbackPerformance = dtf.performance
  const { data: detailedPerformance } = useDetailedSevenDayPerformance(dtf)
  const performance = detailedPerformance?.length
    ? detailedPerformance
    : fallbackPerformance
  const percentageChange = calculatePercentageChange(performance)
  const performanceDirection = getPerformanceDirection(performance)
  const performanceColorClassName = cn(
    performanceDirection === 'positive' && 'text-[#657D32]',
    performanceDirection === 'negative' && 'text-red-600'
  )
  const strokeGradientId = `${useId().replace(/:/g, '')}-performance-stroke`
  const lineStroke =
    performanceDirection === 'positive'
      ? `url(#${strokeGradientId})`
      : 'currentColor'

  return (
    <div className="flex items-center justify-end gap-4">
      <div className="text-right">
        {percentageChange ? (
          <span className={performanceColorClassName}>{percentageChange}</span>
        ) : (
          <span className="text-legend">No data</span>
        )}
      </div>
      {performance.length > 1 && (
        <ChartContainer
          config={chartConfig}
          className={cn('h-10 w-[90px]', performanceColorClassName)}
        >
          <LineChart
            data={performance}
            margin={{ top: 3, right: 2, bottom: 3, left: 2 }}
          >
            {performanceDirection === 'positive' && (
              <defs>
                <linearGradient
                  id={strokeGradientId}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#A2BB6E" />
                  <stop offset="100%" stopColor="#657D32" />
                </linearGradient>
              </defs>
            )}
            <YAxis hide visibility="0" domain={getSparklineValueDomain} />
            <Line
              type="linear"
              dataKey="value"
              stroke={lineStroke}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      )}
    </div>
  )
}

export const indexDTFColumns: ColumnDef<IndexDTFItem>[] = [
  {
    header: ({ column }) => (
      <SorteableButton column={column}>Name</SorteableButton>
    ),
    accessorKey: 'name',
    meta: {
      className: 'w-[500px] max-w-[500px]',
    },
    cell: ({ row }) => (
      <Link
        to={getFolioRoute(row.original.address, row.original.chainId)}
        className="flex min-w-0 items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex-shrink-0">
          <TokenLogo src={row.original.brand?.icon || undefined} size="xl" />
          <ChainLogo
            chain={row.original.chainId}
            className="absolute -bottom-1 -right-1 rounded-full border-2 border-card"
          />
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-1 break-words pt-0.5">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold leading-tight">
              {row.original.name}
              <span className="ml-2 font-light text-legend/70">
                ${row.original.symbol}
              </span>
            </h4>
            {isInactiveDTF(row.original.status) && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400">
                Inactive
              </span>
            )}
          </div>
          <span className="text-sm leading-tight text-legend">
            {row.original.brand?.tags?.length
              ? row.original.brand.tags.join(', ')
              : 'No tags'}
          </span>
        </div>
      </Link>
    ),
  },
  {
    header: () => <TableHeader>Exposure</TableHeader>,
    accessorKey: 'basket',
    meta: {
      className: 'w-[180px] min-w-[180px] pr-2',
    },
    cell: ({ row }) => {
      const basket = row.original.basket
      const hiddenAssetCount = Math.max(0, basket.length - LIMIT_ASSETS)
      const hoverHiddenAssetCount = Math.max(
        0,
        basket.length - HOVER_LIMIT_ASSETS
      )
      const cappedBacking = withChainId(
        basket.slice(0, LIMIT_ASSETS),
        row.original.chainId
      )
      const hoverBacking = withChainId(
        basket.slice(0, HOVER_LIMIT_ASSETS),
        row.original.chainId
      )

      return (
        <div className="relative flex h-10 w-full items-center">
          <BasketHoverCard indexDTF={row.original}>
            <div
              className={cn(
                exposureTriggerClassName,
                hiddenAssetCount > 0 && 'group-hover/dtf-row:opacity-0'
              )}
            >
              <StackTokenLogo
                className="[&>div]:rounded-full [&>div]:border-2 [&>div]:border-card [&>div]:bg-card"
                tokens={cappedBacking}
                overlap={2}
                size={24}
                reverseStack
                outsource
              />
              {hiddenAssetCount > 0 && (
                <span className="inline-flex w-6 justify-center text-sm text-legend">
                  +{hiddenAssetCount}
                </span>
              )}
            </div>
          </BasketHoverCard>
          {hiddenAssetCount > 0 && (
            <BasketHoverCard indexDTF={row.original}>
              <div
                className={cn(
                  exposureTriggerClassName,
                  'absolute left-0 top-1/2 hidden -translate-y-1/2 group-hover/dtf-row:flex'
                )}
              >
                <StackTokenLogo
                  className="[&>div]:rounded-full [&>div]:border-2 [&>div]:border-card [&>div]:bg-card"
                  tokens={hoverBacking}
                  overlap={2}
                  size={24}
                  reverseStack
                  outsource
                />
                {hoverHiddenAssetCount > 0 && (
                  <span className="inline-flex w-6 justify-center text-sm text-legend">
                    +{hoverHiddenAssetCount}
                  </span>
                )}
              </div>
            </BasketHoverCard>
          )}
        </div>
      )
    },
  },
  {
    header: ({ column }) => (
      <TableHeader className="text-right">
        <SorteableButton column={column}>Market Cap</SorteableButton>
      </TableHeader>
    ),
    accessorKey: 'marketCap',
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <div>
          $
          {formatCurrency(row.original.marketCap, 1, {
            notation: 'compact',
            compactDisplay: 'short',
            minimumFractionDigits: 0,
          })}
        </div>
      </div>
    ),
  },
  {
    header: ({ column }) => (
      <TableHeader className="text-right">
        <SorteableButton column={column}>Price</SorteableButton>
      </TableHeader>
    ),
    accessorKey: 'price',
    meta: {
      className: 'pl-10 text-right',
    },
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <div>${formatCurrency(row.original.price, 5)}</div>
      </div>
    ),
  },
  {
    header: ({ column }) => (
      <TableHeader className="text-right">
        <SorteableButton column={column}>
          Performance (Last 7 Days)
        </SorteableButton>
      </TableHeader>
    ),
    accessorKey: 'performancePercent',
    meta: {
      className: 'text-right',
    },
    cell: ({ row }) => <PerformanceCell dtf={row.original} />,
  },
]
