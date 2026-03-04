import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatCurrency, getFolioRoute, humanizeDateToNow } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { Line, LineChart, YAxis } from 'recharts'
import { Performance, Top100DTF } from '../types'
import Top100BasketHoverCard from './top100-basket-hover-card'
import Top100TablePlaceholder from './top100-table-placeholder'

const LIMIT_ASSETS = 7

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--card))',
  },
} satisfies ChartConfig

const formatPercentageChange = (performance: Performance[]) => {
  if (performance.length < 2) return <span className="text-legend">No data</span>
  const first = performance[0].value
  const last = performance[performance.length - 1].value
  if (first <= 0) return <span className="text-legend">No data</span>
  const change = ((last - first) / first) * 100
  if (Math.abs(change) < 0.005) return '0.00%'
  return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`
}

const columns: ColumnDef<Top100DTF>[] = [
  {
    header: ({ column }) => (
      <SorteableButton column={column}>Name</SorteableButton>
    ),
    accessorKey: 'name',
    cell: ({ row }) => (
      <div className="flex gap-3 items-center">
        <div className="relative flex-shrink-0">
          <TokenLogo src={row.original.brand?.icon || undefined} size="xl" />
          <ChainLogo
            chain={row.original.chainId}
            className="absolute -bottom-1 -right-1"
          />
        </div>
        <div className="break-words max-w-[300px]">
          <h4 className="font-semibold">{row.original.name}</h4>
          <span className="text-legend">${row.original.symbol}</span>
        </div>
      </div>
    ),
  },
  {
    header: () => <span className="text-legend">Backing</span>,
    accessorKey: 'basket',
    enableSorting: false,
    cell: ({ row }) => {
      const basket = row.original.basket
      if (!basket.length) {
        return (
          <div className="flex -space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-6 w-6 rounded-full border-2 border-background"
              />
            ))}
          </div>
        )
      }
      const head = basket.slice(0, LIMIT_ASSETS)
      return (
        <Top100BasketHoverCard dtf={row.original}>
          <div>
            <StackTokenLogo
              tokens={head.map((r) => ({
                ...r,
                chain: row.original.chainId,
              }))}
              overlap={2}
              size={24}
              reverseStack
              outsource
            />
          </div>
        </Top100BasketHoverCard>
      )
    },
  },
  {
    header: ({ column }) => (
      <div className="text-right">
        <SorteableButton column={column}>Price</SorteableButton>
      </div>
    ),
    accessorKey: 'price',
    cell: ({ row }) => (
      <div className="text-right min-w-[90px]">
        {row.original.price !== null ? (
          `$${formatCurrency(row.original.price, 5)}`
        ) : (
          <Skeleton className="h-5 w-[80px] ml-auto" />
        )}
      </div>
    ),
  },
  {
    header: ({ column }) => (
      <div className="text-right">
        <SorteableButton column={column}>Market Cap</SorteableButton>
      </div>
    ),
    accessorKey: 'marketCap',
    cell: ({ row }) => (
      <div className="text-right min-w-[100px]">
        {row.original.marketCap !== null ? (
          `$${formatCurrency(row.original.marketCap, 0)}`
        ) : (
          <Skeleton className="h-5 w-[90px] ml-auto" />
        )}
      </div>
    ),
  },
  {
    header: ({ column }) => (
      <SorteableButton column={column}>
        Performance (7d)
      </SorteableButton>
    ),
    accessorKey: 'performancePercent',
    cell: ({ row }) => {
      const { performance, price } = row.original

      if (price === null) {
        return (
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-[60px]" />
            <Skeleton className="h-6 w-16" />
          </div>
        )
      }

      return (
        <div className="flex items-center justify-center gap-4">
          <div className="text-right">
            <span>{formatPercentageChange(performance)}</span>
            <span className="block text-legend text-xs mt-0.5">
              (${formatCurrency(price, 5)})
            </span>
          </div>
          {performance.length > 1 && (
            <ChartContainer config={chartConfig} className="h-6 w-16">
              <LineChart data={performance}>
                <YAxis hide visibility="0" domain={['dataMin', 'dataMax']} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="currentColor"
                  strokeWidth={1}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
          )}
        </div>
      )
    },
  },
  {
    header: ({ column }) => (
      <div className="text-right">
        <SorteableButton column={column}>Holders</SorteableButton>
      </div>
    ),
    accessorKey: 'currentHolderCount',
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.currentHolderCount.toLocaleString()}
      </div>
    ),
  },
  {
    header: ({ column }) => (
      <div className="text-right">
        <SorteableButton column={column}>Created</SorteableButton>
      </div>
    ),
    accessorKey: 'timestamp',
    cell: ({ row }) => (
      <div className="text-right text-legend">
        {humanizeDateToNow(row.original.timestamp)}
      </div>
    ),
  },
]

const Top100Table = ({
  data,
  isLoading,
}: {
  data: Top100DTF[]
  isLoading: boolean
}) => {
  const navigate = useNavigate()

  if (isLoading) return <Top100TablePlaceholder />

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 bg-card rounded-[20px]">
        <p className="text-muted-foreground">No DTFs found</p>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      pagination={data.length > 20 ? { pageSize: 20 } : undefined}
      onRowClick={(row: Top100DTF) =>
        navigate(getFolioRoute(row.address, row.chainId))
      }
      initialSorting={[{ id: 'timestamp', desc: true }]}
      className={cn(
        '[&_table]:bg-card [&_table]:rounded-[20px] [&_table]:text-base',
        '[&_table_thead_th]:px-6',
        '[&_table_tbody_td]:px-6',
        '[&_table_tbody]:rounded-[20px] [&_table_tbody_tr:last-child_td]:rounded-bl-[20px] [&_table_tbody_tr:last-child_td:last-child]:rounded-br-[20px]'
      )}
    />
  )
}

export default Top100Table
