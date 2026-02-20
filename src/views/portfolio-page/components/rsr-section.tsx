import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import DataTable from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import { CHAIN_TAGS } from '@/utils/constants'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { PortfolioRSRBalance } from '../types'

const columns: ColumnDef<PortfolioRSRBalance, any>[] = [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="relative">
          <TokenLogo symbol="RSR" size="lg" />
          <ChainLogo
            chain={row.original.chainId}
            className="absolute -bottom-0.5 -right-0.5"
            width={12}
            height={12}
          />
        </div>
        <div>
          <p className="font-medium">RSR</p>
          <p className="text-xs text-legend hidden sm:block">
            {CHAIN_TAGS[row.original.chainId] || 'Unknown'}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'performance7d',
    accessorKey: 'performance7d',
    header: '7d Perf',
    cell: ({ row }) => {
      const perf = row.original.performance7d
      return (
        <div
          className={cn(
            'flex items-center gap-1',
            perf > 0 ? 'text-primary' : perf < 0 ? 'text-destructive' : 'text-legend'
          )}
        >
          {perf > 0 && <ArrowUp size={12} />}
          {perf < 0 && <ArrowDown size={12} />}
          <span className="text-sm">
            {perf > 0 ? '+' : ''}
            {formatCurrency(perf)}%
          </span>
        </div>
      )
    },
    meta: { className: 'hidden sm:table-cell' },
  },
  {
    id: 'balance',
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => (
      <span className="text-sm">{formatCurrency(row.original.balance)}</span>
    ),
  },
  {
    id: 'value',
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        ${formatCurrency(row.original.value)}
      </span>
    ),
  },
]

const RSRSection = ({
  rsrBalances,
}: {
  rsrBalances: PortfolioRSRBalance[]
}) => {
  if (!rsrBalances.length) return null

  return (
    <div className="rounded-4xl bg-secondary">
      <div className="py-4 px-5">
        <h2 className="font-semibold text-xl text-primary dark:text-muted-foreground">
          RSR
        </h2>
        <p className="text-sm text-legend mt-1">
          Reserve Rights token holdings across chains
        </p>
      </div>
      <div className="bg-card rounded-3xl m-1 mt-0">
        <DataTable columns={columns} data={rsrBalances} />
      </div>
    </div>
  )
}

export default RSRSection
