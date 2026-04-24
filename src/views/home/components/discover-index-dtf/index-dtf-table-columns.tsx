import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { SorteableButton } from '@/components/ui/data-table'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { cn } from '@/lib/utils'
import { formatCurrency, getFolioRoute } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { Link } from 'react-router-dom'
import { Line, LineChart, YAxis } from 'recharts'
import { BasketHoverCard } from './basket-hover-card'
import { calculatePercentageChange } from './utils'

export const LIMIT_ASSETS = 7

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

export const indexDTFColumns: ColumnDef<IndexDTFItem>[] = [
  {
    header: ({ column }) => (
      <SorteableButton column={column}>Name</SorteableButton>
    ),
    accessorKey: 'name',
    cell: ({ row }) => (
      <Link
        to={getFolioRoute(row.original.address, row.original.chainId)}
        className="flex gap-3 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex-shrink-0">
          <TokenLogo src={row.original.brand?.icon || undefined} size="xl" />
          <ChainLogo
            chain={row.original.chainId}
            className="absolute -bottom-1 -right-1"
          />
        </div>
        <div className="break-words  max-w-[420px]">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold ">{row.original.name}</h4>
            {isInactiveDTF(row.original.status) && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400">
                Inactive
              </span>
            )}
          </div>
          <span className="text-legend">${row.original.symbol}</span>
        </div>
      </Link>
    ),
  },
  {
    header: () => <TableHeader>Backing</TableHeader>,
    accessorKey: 'basket',
    cell: ({ row }) => {
      const head = row.original.basket.slice(0, LIMIT_ASSETS)
      return (
        <div className="flex items-center gap-2">
          <BasketHoverCard indexDTF={row.original}>
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
          </BasketHoverCard>
        </div>
      )
    },
  },
  {
    accessorKey: 'chainId',
    header: () => <div className="text-center text-legend">Tags</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.brand?.tags?.length ? (
          row.original.brand.tags.join(', ')
        ) : (
          <div className="text-legend">None</div>
        )}
      </div>
    ),
  },
  {
    header: ({ column }) => (
      <SorteableButton column={column}>
        Performance (Last 7 Days)
      </SorteableButton>
    ),
    accessorKey: 'performancePercent',
    cell: ({ row }) => {
      const { performance } = row.original
      const percentageChange = calculatePercentageChange(performance)

      return (
        <div className="flex items-center justify-center gap-4">
          <div className="text-right">
            {percentageChange ? (
              <span>{percentageChange}</span>
            ) : (
              <span className="text-legend">No data</span>
            )}
            <span className="block text-legend text-xs mt-0.5">
              (${formatCurrency(row.original.price, 5)})
            </span>
          </div>
          {performance.length > 0 && (
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
      <TableHeader className="text-right">
        <SorteableButton column={column}>Market Cap</SorteableButton>
      </TableHeader>
    ),
    accessorKey: 'marketCap',
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <div>${formatCurrency(row.original.marketCap, 0)}</div>
      </div>
    ),
  },
]
