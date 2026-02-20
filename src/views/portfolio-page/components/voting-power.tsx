import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import Copy from '@/components/ui/copy'
import DataTable from '@/components/ui/data-table'
import { formatCurrency, shortenAddress } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { Scale } from 'lucide-react'
import { PortfolioVoteLock } from '../types'
import { ExpandToggle, useExpandable } from './expand-toggle'
import SectionHeader from './section-header'

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
        <div className="relative flex-shrink-0">
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
    cell: ({ row }) => {
      const val = row.original.votingPower
      return (
        <span className="text-sm">
          {val != null && !isNaN(val) ? formatCurrency(val) : '—'}
        </span>
      )
    },
  },
  {
    id: 'voteWeight',
    accessorKey: 'voteWeight',
    header: 'Vote Weight',
    cell: ({ row }) => {
      const val = row.original.voteWeight
      return (
        <span className="text-sm">
          {val != null && !isNaN(val) ? `${formatCurrency(val)}%` : '—'}
        </span>
      )
    },
    meta: { className: 'hidden lg:table-cell' },
  },
  {
    id: 'voterAddress',
    header: 'Vote-locker Address',
    cell: ({ row }) => {
      const addr = row.original.stTokenAddress
      if (!addr) return <span className="text-sm text-legend">—</span>
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm">{shortenAddress(addr)}</span>
          <Copy value={addr} />
        </div>
      )
    },
    meta: { className: 'hidden lg:table-cell' },
  },
  {
    id: 'delegation',
    header: 'Delegate Address',
    cell: ({ row }) => {
      const delegation = row.original.delegation
      if (!delegation)
        return <span className="text-sm text-legend">—</span>
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm">{shortenAddress(delegation)}</span>
          <Copy value={delegation} />
        </div>
      )
    },
    meta: { className: 'hidden lg:table-cell' },
  },
]

const VotingPower = ({ voteLocks }: { voteLocks: PortfolioVoteLock[] }) => {
  const { displayData, expanded, toggle, hasMore, total } =
    useExpandable(voteLocks)

  if (!voteLocks.length) return null

  return (
    <div>
      <SectionHeader
        icon={Scale}
        title="Voting Power"
        subtitle="Including any power delegated to me."
      />
      <div className="bg-card rounded-[20px] border border-border overflow-hidden">
        <DataTable columns={columns} data={displayData} />
        {hasMore && (
          <ExpandToggle expanded={expanded} total={total} onToggle={toggle} />
        )}
      </div>
    </div>
  )
}

export default VotingPower
