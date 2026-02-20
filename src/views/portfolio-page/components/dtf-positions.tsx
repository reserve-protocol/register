import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
import { formatCurrency } from '@/utils'
import { getFolioRoute, getTokenRoute } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PortfolioIndexDTF, PortfolioYieldDTF } from '../types'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'

type DTFRow = {
  address: string
  chainId: number
  name: string
  symbol: string
  logo?: string
  balance: number
  value: number
  performance7d: number
  isIndex: boolean
}

const columns: ColumnDef<DTFRow, any>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="relative">
          <TokenLogo
            symbol={row.original.symbol}
            address={row.original.address}
            chain={row.original.chainId}
            src={row.original.logo}
            size="lg"
          />
          <ChainLogo
            chain={row.original.chainId}
            className="absolute -bottom-0.5 -right-0.5"
            width={12}
            height={12}
          />
        </div>
        <div>
          <p className="font-medium">{row.original.symbol}</p>
          <p className="text-xs text-legend hidden sm:block">
            {row.original.name}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'performance7d',
    accessorKey: 'performance7d',
    header: ({ column }) => (
      <SorteableButton column={column} className="hidden sm:flex">
        7d Perf
      </SorteableButton>
    ),
    cell: ({ row }) => {
      const perf = row.original.performance7d
      return (
        <div
          className={cn(
            'items-center gap-1 hidden sm:flex',
            perf > 0 ? 'text-primary' : perf < 0 ? 'text-destructive' : 'text-legend'
          )}
        >
          {perf > 0 && <ArrowUp size={12} />}
          {perf < 0 && <ArrowDown size={12} />}
          <span className="text-sm">{perf > 0 ? '+' : ''}{formatCurrency(perf)}%</span>
        </div>
      )
    },
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    id: 'balance',
    accessorKey: 'balance',
    header: ({ column }) => (
      <SorteableButton column={column}>Balance</SorteableButton>
    ),
    cell: ({ row }) => (
      <span className="text-sm">{formatCurrency(row.original.balance)}</span>
    ),
  },
  {
    id: 'value',
    accessorKey: 'value',
    header: ({ column }) => (
      <SorteableButton column={column}>Value</SorteableButton>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        ${formatCurrency(row.original.value)}
      </span>
    ),
  },
]

const DTFPositions = ({
  indexDTFs,
  yieldDTFs,
}: {
  indexDTFs: PortfolioIndexDTF[]
  yieldDTFs: PortfolioYieldDTF[]
}) => {
  const navigate = useNavigate()

  const rows: DTFRow[] = useMemo(() => {
    const index = indexDTFs.map((d) => ({ ...d, isIndex: true }))
    const yields = yieldDTFs.map((d) => ({ ...d, isIndex: false }))
    return [...index, ...yields].sort((a, b) => b.value - a.value)
  }, [indexDTFs, yieldDTFs])

  if (!rows.length) return null

  return (
    <div className="rounded-4xl bg-secondary">
      <div className="flex items-center justify-between py-4 px-5">
        <h2 className="font-semibold text-xl text-primary dark:text-muted-foreground">
          DTF Positions
        </h2>
        <Link to={ROUTES.HOME} className="text-sm text-primary hover:underline">
          Browse all Index DTFs →
        </Link>
      </div>
      <div className="bg-card rounded-3xl m-1 mt-0">
        <DataTable
          columns={columns}
          data={rows}
          onRowClick={(row) => {
            const route = row.isIndex
              ? getFolioRoute(row.address, row.chainId)
              : getTokenRoute(row.address, row.chainId)
            navigate(route)
          }}
          initialSorting={[{ id: 'value', desc: true }]}
        />
      </div>
    </div>
  )
}

export default DTFPositions
