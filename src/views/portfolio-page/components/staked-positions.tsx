import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
import { formatCurrency } from '@/utils'
import { getTokenRoute } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { PortfolioStakedRSR } from '../types'

const columns: ColumnDef<PortfolioStakedRSR, any>[] = [
  {
    id: 'dtfName',
    accessorKey: 'dtfName',
    header: 'Position',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="relative">
          <TokenLogo
            symbol={row.original.dtfSymbol}
            address={row.original.dtfAddress}
            chain={row.original.chainId}
            src={row.original.dtfLogo}
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
          <p className="font-medium">{row.original.dtfSymbol}</p>
          <p className="text-xs text-legend hidden sm:block">
            {row.original.dtfName}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'apy',
    accessorKey: 'apy',
    header: ({ column }) => (
      <SorteableButton column={column}>APY</SorteableButton>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-primary">
        {formatCurrency(row.original.apy)}%
      </span>
    ),
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
    id: 'valueUSD',
    accessorKey: 'valueUSD',
    header: ({ column }) => (
      <SorteableButton column={column}>Value (USD)</SorteableButton>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        ${formatCurrency(row.original.valueUSD)}
      </span>
    ),
  },
  {
    id: 'valueRSR',
    accessorKey: 'valueRSR',
    header: 'Value (RSR)',
    cell: ({ row }) => (
      <span className="text-sm">
        {formatCurrency(row.original.valueRSR)} RSR
      </span>
    ),
    meta: { className: 'hidden md:table-cell' },
  },
]

const StakedPositions = ({
  stakedRSR,
}: {
  stakedRSR: PortfolioStakedRSR[]
}) => {
  const navigate = useNavigate()

  if (!stakedRSR.length) return null

  return (
    <div className="rounded-4xl bg-secondary">
      <div className="py-4 px-5">
        <h2 className="font-semibold text-xl text-primary dark:text-muted-foreground">
          Staked Positions
        </h2>
      </div>
      <div className="bg-card rounded-3xl m-1 mt-0">
        <DataTable
          columns={columns}
          data={stakedRSR}
          onRowClick={(row) =>
            navigate(getTokenRoute(row.dtfAddress, row.chainId, 'staking'))
          }
          initialSorting={[{ id: 'valueUSD', desc: true }]}
        />
      </div>
    </div>
  )
}

export default StakedPositions
