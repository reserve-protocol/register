import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import Copy from '@/components/ui/copy'
import DataTable from '@/components/ui/data-table'
import { formatCurrency, shortenAddress } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { PortfolioVoteLock } from '../types'

const columns: ColumnDef<PortfolioVoteLock, any>[] = [
  {
    id: 'dtf',
    header: 'DTF Governed',
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.dtfs?.map((d) => d.symbol).join(', ') || '—'}
      </span>
    ),
  },
  {
    id: 'govToken',
    header: 'Governance Token',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="relative">
          <TokenLogo
            symbol={row.original.stTokenSymbol}
            address={row.original.stTokenAddress}
            chain={row.original.chainId}
            src={row.original.stTokenLogo}
            size="md"
          />
          <ChainLogo
            chain={row.original.chainId}
            className="absolute -bottom-0.5 -right-0.5"
            width={10}
            height={10}
          />
        </div>
        <span className="text-sm">{row.original.stTokenSymbol}</span>
      </div>
    ),
  },
  {
    id: 'votingPower',
    accessorKey: 'votingPower',
    header: 'Vote Power',
    cell: ({ row }) => (
      <span className="text-sm">{formatCurrency(row.original.votingPower)}</span>
    ),
  },
  {
    id: 'voteWeight',
    accessorKey: 'voteWeight',
    header: 'Vote Weight',
    cell: ({ row }) => (
      <span className="text-sm">{formatCurrency(row.original.voteWeight)}%</span>
    ),
    meta: { className: 'hidden md:table-cell' },
  },
  {
    id: 'delegation',
    header: 'Delegate',
    cell: ({ row }) => {
      const delegation = row.original.delegation
      if (!delegation) return <span className="text-sm text-legend">—</span>
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm">{shortenAddress(delegation)}</span>
          <Copy value={delegation} />
        </div>
      )
    },
    meta: { className: 'hidden md:table-cell' },
  },
]

const VotingPower = ({ voteLocks }: { voteLocks: PortfolioVoteLock[] }) => {
  if (!voteLocks.length) return null

  return (
    <div className="rounded-4xl bg-secondary">
      <div className="py-4 px-5">
        <h2 className="font-semibold text-xl text-primary dark:text-muted-foreground">
          Voting Power
        </h2>
      </div>
      <div className="bg-card rounded-3xl m-1 mt-0">
        <DataTable columns={columns} data={voteLocks} />
      </div>
    </div>
  )
}

export default VotingPower
