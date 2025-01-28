import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import DataTable from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import useIndexDTFList, { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercentage } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Line, LineChart } from 'recharts'
import DTFFilters from './components/dtf-filters'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainFilterAtom, searchFilterAtom } from './atoms/filter'

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
          <TokenLogo address={row.original.address} size="xl" />
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

const DTFCard = ({ dtf }: { dtf: IndexDTFItem }) => {
  const LIMIT = 4

  const head = dtf.basket.slice(0, LIMIT)
  const tail = dtf.basket.length - LIMIT

  const percentageChange = calculatePercentageChange(dtf.performance)

  return (
    <div className="p-4 [&:not(:last-child)]:border-b">
      <div className="flex justify-between mb-2">
        <TokenLogo address={dtf.address} size="xl" />
        <div>
          <span>{percentageChange} </span>
          <span className="text-legend">(7d)</span>
        </div>
      </div>
      <div className="flex justify-between">
        <div>
          <h4 className="font-semibold mb-[2px]">{dtf.name}</h4>
          <div className="flex">
            <div>{head.map((t) => t.symbol).join(', ')}</div>
            {tail > 0 && <div className="text-[#0955AC] ml-[6px]">+{tail}</div>}
          </div>
        </div>

        <div className="flex items-end">
          <Link
            to={`/${dtf.chainId}/index-dtf/${dtf.address}/overview`}
          >
            <Button variant="muted" size="icon-rounded">
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

const IndexDTFList = () => {
  const { data, isLoading } = useIndexDTFList()

  const search = useAtomValue(searchFilterAtom)
  const chains = useAtomValue(chainFilterAtom)

  const filtered = useMemo(() => {
    if (!data) {
      return []
    }

    return data.filter((dtf) => {
      if (!chains.length || !chains.includes(dtf.chainId)) {
        return false
      }

      if (search) {
        const searchLower = search.toLowerCase()
        const nameMatch = dtf.name.toLowerCase().includes(searchLower)
        const symbolMatch = dtf.symbol.toLowerCase().includes(searchLower)
        const collateralMatch = dtf.basket?.some((collateral) =>
          collateral.symbol.toLowerCase().includes(searchLower)
        )

        if (!nameMatch && !symbolMatch && !collateralMatch) {
          return false
        }
      }

      return true
    })
  }, [data, search, chains])

  if (isLoading) {
    return <Skeleton className="h-[500px] rounded-[20px]" />
  }

  return (
    <div className="flex flex-col gap-1 p-1 rounded-[20px] bg-secondary">
      <DTFFilters />
      <DataTable
        columns={columns}
        data={filtered}
        className={cn(
          'hidden sm:table bg-card text-base rounded-[20px]',
          '[&_thead_th]:px-6',
          '[&_tbody_td]:px-6',
          '[&_tbody]:rounded-[20px] [&_tbody_tr:last-child_td]:rounded-bl-[20px] [&_tbody_tr:last-child_td:last-child]:rounded-br-[20px]'
        )}
      />
      <div className="sm:hidden bg-card rounded-[20px]">
        {filtered.map((dtf) => {
          return <DTFCard key={dtf.address} dtf={dtf} />
        })}
      </div>
    </div>
  )
}

const DiscoverIndexDTF = () => {
  return <IndexDTFList />
}

export default DiscoverIndexDTF
