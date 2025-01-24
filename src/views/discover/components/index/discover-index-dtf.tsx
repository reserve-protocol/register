import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import DataTable from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import useIndexDTFList, { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercentage } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowRight, Circle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Line, LineChart } from 'recharts'

const DiscoverHighlightIndex = () => {
  return (
    <div>
      <h2 className="text-primary text-center text-xl font-bold">Discover</h2>
      <div className="flex py-6 gap-2">
        <Card className="border-secondary border-2 flex-grow ">
          <CardTitle className="p-4 text-md font-light text-primary flex flex-col items-center gap-1 border-b border-secondary">
            <Circle className="h-4 w-4" />
            Highest Market Cap DTF
          </CardTitle>
          <CardContent className="p-4"></CardContent>
        </Card>
        <Card className="border-secondary border-2 flex-grow ">
          <CardTitle className="p-4 text-md font-light text-primary flex flex-col items-center gap-1 border-b border-secondary">
            <Circle className="h-4 w-4" />
            Highest Market Cap DTF
          </CardTitle>
          <CardContent className="p-4"></CardContent>
        </Card>
        <Card className="border-secondary border-2 flex-grow ">
          <CardTitle className="p-4 text-md font-light text-primary flex flex-col items-center gap-1 border-b border-secondary">
            <Circle className="h-4 w-4" />
            Highest Market Cap DTF
          </CardTitle>
          <CardContent className="p-4"></CardContent>
        </Card>
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

const calculatePercentageChange = (
  performance: IndexDTFItem['performance']
) => {
  if (performance.length === 0) {
    return 'N/A'
  }
  const firstValue = performance[0].value
  const lastValue = performance[performance.length - 1].value
  const percentageChange = ((lastValue - firstValue) / firstValue) * 100
  return `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(2)}%`
}

const TableHeader = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => <div className={cn('text-legend', className)}>{children}</div>

const columns: ColumnDef<IndexDTFItem>[] = [
  {
    header: () => <TableHeader>Name</TableHeader>,
    accessorKey: 'name',
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          <TokenLogo size="xl" />
          <div>
            <h4 className="font-semibold mb-[2px]">{row.original.name}</h4>
            <span className="text-legend">${row.original.symbol}</span>
          </div>
        </div>
      )
    },
  },
  {
    header: () => <TableHeader>Backing</TableHeader>,
    accessorKey: 'basket',
    cell: ({ row }) => {
      const LIMIT = 3

      const head = row.original.basket.slice(0, LIMIT)
      const tail = row.original.basket.length - LIMIT

      // TODO(jg): Logos for basket assets
      return (
        <div className="flex items-center gap-2">
          <div>
            <StackTokenLogo tokens={head} overlap={2} size={24} reverseStack />
          </div>
          <div className="flex">
            <div>{head.map((t) => t.symbol).join(', ')}</div>
            {tail > 0 && <div className="text-[#0955AC] ml-[6px]">+{tail}</div>}
          </div>
        </div>
      )
    },
  },
  {
    header: () => (
      <TableHeader className="text-right max-w-[340px]">
        Performance (Last 7 Days)
      </TableHeader>
    ),
    accessorKey: 'performance',
    cell: ({ row }) => {
      const { performance } = row.original
      const percentageChange = calculatePercentageChange(performance)

      return (
        <div className="flex items-center justify-end gap-4">
          <span>{percentageChange}</span>
          {performance.length > 0 && (
            <ChartContainer config={chartConfig} className="h-6 w-16">
              <LineChart data={performance}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#000"
                  strokeWidth={2}
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
    header: () => <TableHeader className="text-right">Price</TableHeader>,
    accessorKey: 'price',
    cell: ({ row }) => {
      return (
        <div className="text-right">${formatCurrency(row.original.price)}</div>
      )
    },
  },
  {
    header: () => (
      <TableHeader className="text-right">Annualized TVL Fee</TableHeader>
    ),
    accessorKey: 'fee',
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end">
          <div className="mr-6">{formatPercentage(row.original.fee)}</div>
          <Link
            to={`/${row.original.chainId}/index-dtf/${row.original.address}/overview`}
          >
            <Button variant="muted" size="icon-rounded">
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      )
    },
  },
]

const IndexDTFList = () => {
  const { data, isLoading } = useIndexDTFList()

  if (isLoading) {
    return <Skeleton className="h-[500px] rounded-[20px]" />
  }

  return (
    <div className="flex flex-col gap-1 p-1 rounded-[20px] bg-secondary">
      <DataTable
        columns={columns}
        data={data ?? []}
        className={cn(
          'bg-card text-base rounded-[20px]',
          '[&_thead_th]:px-6',
          '[&_tbody_td]:px-6',
          '[&_tbody]:rounded-[20px] [&_tbody_tr:last-child_td]:rounded-bl-[20px] [&_tbody_tr:last-child_td:last-child]:rounded-br-[20px]'
        )}
      />
    </div>
  )
}

const DiscoverIndexDTF = () => {
  return (
    <div className="px-6">
      <DiscoverHighlightIndex />
      <h2 className="text-primary text-center text-xl font-bold mb-6">
        All Reserve Index DTFs
      </h2>
      <IndexDTFList />
    </div>
  )
}

export default DiscoverIndexDTF
