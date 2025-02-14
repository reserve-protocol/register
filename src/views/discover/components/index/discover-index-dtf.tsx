import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import useIndexDTFList, { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercentage, getFolioRoute } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Line, LineChart, YAxis } from 'recharts'
import { chainFilterAtom, searchFilterAtom } from './atoms/filter'
import DTFFilters from './components/dtf-filters'
import { CHAIN_TAGS, CHAIN_TO_NETWORK } from '@/utils/constants'
import ChainLogo from '@/components/icons/ChainLogo'

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
    return <span className="text-legend">No data</span>
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
    header: ({ column }) => (
      <SorteableButton column={column}>Name</SorteableButton>
    ),
    accessorKey: 'name',
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          <TokenLogo address={row.original.address} size="xl" />
          <div className="max-w-52 break-words">
            <h4 className="font-semibold mb-[2px]">{row.original.name}</h4>
            <span className="text-legend">${row.original.symbol}</span>
          </div>
        </div>
      )
    },
  },
  {
    header: ({ column }) => (
      <SorteableButton column={column}>Network</SorteableButton>
    ),
    accessorKey: 'chainId',
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          <ChainLogo chain={row.original.chainId} />
          {CHAIN_TAGS[row.original.chainId]}
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
            <StackTokenLogo
              tokens={head.map((r) => ({ ...r, chain: row.original.chainId }))}
              overlap={2}
              size={24}
              reverseStack
              outsource
            />
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
        <div className="flex items-center justify-end gap-4">
          <span>{percentageChange}</span>
          {performance.length > 0 && (
            <ChartContainer config={chartConfig} className="h-6 w-16">
              <LineChart data={performance}>
                <YAxis hide visibility="0" domain={['dataMin', 'dataMax']} />
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
    header: ({ column }) => (
      <TableHeader className="text-right">
        <SorteableButton column={column}>Price</SorteableButton>
      </TableHeader>
    ),
    accessorKey: 'price',
    cell: ({ row }) => {
      return (
        <div className="text-right">${formatCurrency(row.original.price)}</div>
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
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end">
          <div className="mr-6">${formatCurrency(row.original.marketCap)}</div>
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
    <Link to={getFolioRoute(dtf.address, dtf.chainId)}>
      <div className="p-4">
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
              {tail > 0 && (
                <div className="text-[#0955AC] ml-[6px]">+{tail}</div>
              )}
            </div>
          </div>

          <div className="flex items-end">
            <Button variant="muted" size="icon-rounded">
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}

const IndexDTFList = () => {
  const { data, isLoading } = useIndexDTFList()
  const navigate = useNavigate()
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

  const handleRowClick = (row: IndexDTFItem) => {
    navigate(getFolioRoute(row.address, row.chainId))
  }

  return (
    <div className="flex flex-col gap-1 p-1 rounded-[20px] bg-secondary">
      <DTFFilters />
      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={handleRowClick}
        className={cn(
          'hidden sm:table bg-card text-base rounded-[20px]',
          '[&_thead_th]:px-6',
          '[&_tbody_td]:px-6',
          '[&_tbody]:rounded-[20px] [&_tbody_tr:last-child_td]:rounded-bl-[20px] [&_tbody_tr:last-child_td:last-child]:rounded-br-[20px]'
        )}
      />
      <div className="sm:hidden bg-card rounded-[20px]">
        {filtered.map((dtf) => (
          <div key={dtf.address} className="[&:not(:last-child)]:border-b">
            <DTFCard dtf={dtf} />
          </div>
        ))}
      </div>
    </div>
  )
}

const DiscoverIndexDTF = () => {
  return <IndexDTFList />
}

export default DiscoverIndexDTF
