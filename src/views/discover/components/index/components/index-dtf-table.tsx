import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
import { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { cn } from '@/lib/utils'
import { formatCurrency, getFolioRoute } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { Link, useNavigate } from 'react-router-dom'
import { Line, LineChart, YAxis } from 'recharts'
import { calculatePercentageChange } from '../utils'
import { BasketHoverCard } from './basket-hover-card'
import { Skeleton } from '@/components/ui/skeleton'

const Placeholder = () => {
  return (
    <div className="p-2 bg-card rounded-4xl">
      <div className="grid grid-cols-[440px_1fr_1fr_1fr_1fr] text-legend gap-4 px-4 py-4 border-b">
        <div>Name</div>
        <div>Backing</div>
        <div>Tags</div>
        <div>Performance (Last 7 Days)</div>
        <div className="text-right">Market Cap</div>
      </div>

      {/* Table rows */}
      {Array.from({ length: 15 }).map((_, index) => (
        <div
          key={index}
          className={`grid grid-cols-[440px_1fr_1fr_1fr_1fr] gap-4 py-6 px-4 ${index !== 14 ? 'border-b' : ''}`}
        >
          <div className="flex items-center gap-3 ">
            <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-background"
                />
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <Skeleton className="h-6 w-[150px]" />
          </div>
          <div className="flex items-center gap-2">
            <div className="space-y-1">
              <Skeleton className="h-5 w-[80px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
            <Skeleton className="h-10 w-[80px]" />
          </div>
          <div className="flex justify-end items-center">
            <Skeleton className="h-6 w-[100px]" />
          </div>
        </div>
      ))}
    </div>
  )
}

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

const columns: ColumnDef<IndexDTFItem>[] = [
  {
    header: ({ column }) => (
      <SorteableButton column={column} className="-ml-4">
        Name
      </SorteableButton>
    ),
    accessorKey: 'name',
    cell: ({ row }) => {
      return (
        <Link
          to={getFolioRoute(row.original.address, row.original.chainId)}
          className="flex gap-3 items-center"
        >
          <div className="relative">
            <TokenLogo src={row.original.brand?.icon || undefined} size="xl" />
            <ChainLogo
              chain={row.original.chainId}
              className="absolute -bottom-1 -right-1"
            />
          </div>
          <div className="break-words  max-w-[420px]">
            <h4 className="font-semibold ">{row.original.name}</h4>
            <span className="text-legend">${row.original.symbol}</span>
          </div>
        </Link>
      )
    },
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
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.brand?.tags?.length ? (
            row.original.brand.tags.join(', ')
          ) : (
            <div className="text-legend">None</div>
          )}
        </div>
      )
    },
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
            <span>{percentageChange}</span>
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
  // {
  //   header: ({ column }) => (
  //     <TableHeader className="text-right">
  //       <SorteableButton column={column}>Price</SorteableButton>
  //     </TableHeader>
  //   ),
  //   accessorKey: 'price',
  //   cell: ({ row }) => {
  //     return (
  //       <div className="text-right">${formatCurrency(row.original.price)}</div>
  //     )
  //   },
  // },
  {
    header: ({ column }) => (
      <TableHeader className="text-right -mr-4">
        <SorteableButton column={column}>Market Cap</SorteableButton>
      </TableHeader>
    ),
    accessorKey: 'marketCap',
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end">
          <div>${formatCurrency(row.original.marketCap, 0)}</div>
        </div>
      )
    },
  },
]

const IndexDTFTable = ({
  data,
  isLoading,
}: {
  data: IndexDTFItem[]
  isLoading: boolean
}) => {
  const navigate = useNavigate()

  const handleRowClick = (row: IndexDTFItem) => {
    navigate(getFolioRoute(row.address, row.chainId))
  }

  if (isLoading) {
    return <Placeholder />
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        pagination={
          data.length > 20
            ? {
                pageSize: 20,
              }
            : undefined
        }
        onRowClick={handleRowClick}
        className={cn(
          'hidden lg:block',
          '[&_table]:bg-card [&_table]:rounded-[20px] [&_table]:text-base',
          '[&_table_thead_th]:px-6',
          '[&_table_tbody_td]:px-6',
          '[&_table_tbody]:rounded-[20px] [&_table_tbody_tr:last-child_td]:rounded-bl-[20px] [&_table_tbody_tr:last-child_td:last-child]:rounded-br-[20px]'
        )}
      />
    </>
  )
}

export default IndexDTFTable
