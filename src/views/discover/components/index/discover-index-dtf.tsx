import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import DataTable from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import useIndexDTFList, { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { formatCurrency, formatPercentage } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowRight, Circle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Line, LineChart, YAxis } from 'recharts'

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
  const firstValue = performance[0].value
  const lastValue = performance[performance.length - 1].value
  const percentageChange = ((lastValue - firstValue) / firstValue) * 100
  return `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(2)}%`
}

const columns: ColumnDef<IndexDTFItem>[] = [
  {
    header: 'Name',
    accessorKey: 'name',
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          <TokenLogo size="xl" />
          <div>
            <h4 className="font-semibold mb-1">{row.original.name}</h4>
            <span className="text-legend">${row.original.symbol}</span>
          </div>
        </div>
      )
    },
  },
  {
    header: 'Backing',
    accessorKey: 'assets',
    cell: ({ row }) => {
      const LIMIT = 3

      return (
        <div>
          {row.original.assets
            .slice(0, LIMIT)
            .map((asset) => asset.symbol)
            .join(', ')}
          &nbsp;&nbsp;
          {row.original.assets.length > LIMIT &&
            `+${row.original.assets.length - LIMIT}`}
        </div>
      )
    },
  },
  {
    header: 'Performance (7d)',
    accessorKey: 'performance',
    cell: ({ row }) => {
      const percentageChange = calculatePercentageChange(
        row.original.performance
      )

      // Display a line chart of the performance
      return (
        <div className="flex items-center gap-4">
          <span>{percentageChange}</span>
          <ChartContainer config={chartConfig} className="h-6 w-16">
            <LineChart data={row.original.performance}>
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
        </div>
      )
    },
  },
  {
    header: 'Price',
    accessorKey: 'id',
    cell: ({ row }) => {
      return `$${formatCurrency(row.original.price)}`
    },
  },
  {
    header: 'Fee',
    accessorKey: 'fee',
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="mr-auto">{formatPercentage(row.original.fee)}</span>
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
        className="bg-card rounded-[20px] [&_tbody]:rounded-[20px] [&_tbody_tr:last-child_td]:rounded-bl-[20px] [&_tbody_tr:last-child_td:last-child]:rounded-br-[20px]"
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
