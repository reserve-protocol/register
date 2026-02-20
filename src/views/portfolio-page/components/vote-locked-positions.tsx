import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
import { formatCurrency } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { PortfolioVoteLock } from '../types'

const columns: ColumnDef<PortfolioVoteLock, any>[] = [
  {
    id: 'stTokenName',
    accessorKey: 'stTokenName',
    header: 'Governance Token',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="relative">
          <TokenLogo
            symbol={row.original.stTokenSymbol}
            address={row.original.stTokenAddress}
            chain={row.original.chainId}
            src={row.original.stTokenLogo}
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
          <p className="font-medium">{row.original.stTokenSymbol}</p>
          <p className="text-xs text-legend hidden sm:block">
            {row.original.stTokenName}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'governs',
    header: 'Governs',
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.dtfs?.map((d) => d.symbol).join(', ') || '—'}
      </span>
    ),
    meta: { className: 'hidden md:table-cell' },
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

const VoteLockedPositions = ({
  voteLocks,
}: {
  voteLocks: PortfolioVoteLock[]
}) => {
  if (!voteLocks.length) return null

  return (
    <div className="rounded-4xl bg-secondary">
      <div className="py-4 px-5">
        <h2 className="font-semibold text-xl text-primary dark:text-muted-foreground">
          Vote-locked Positions
        </h2>
      </div>
      <div className="bg-card rounded-3xl m-1 mt-0">
        <DataTable
          columns={columns}
          data={voteLocks}
          initialSorting={[{ id: 'value', desc: true }]}
        />
      </div>
    </div>
  )
}

export default VoteLockedPositions
