import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import Copy from '@/components/ui/copy'
import DataTable from '@/components/ui/data-table'
import { formatToSignificantDigits, shortenAddress } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { Vote } from 'lucide-react'
import { PortfolioVoteLock } from '../types'
import { ExpandToggle, useExpandable } from './expand-toggle'
import GovernsCell from './governs-cell'
import SectionHeader from './section-header'

const columns: ColumnDef<PortfolioVoteLock, any>[] = [
  {
    id: 'dtf',
    header: 'DTF Governed',
    cell: ({ row }) => (
      <GovernsCell dtfs={row.original.dtfs} chainId={row.original.chainId} />
    ),
  },
  {
    id: 'govToken',
    header: 'Governance Token',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          <TokenLogo
            symbol={row.original.symbol}
            address={row.original.stTokenAddress}
            chain={row.original.chainId}
            size="md"
          />
          <ChainLogo
            chain={row.original.chainId}
            className="absolute -bottom-0.5 -right-0.5"
            width={10}
            height={10}
          />
        </div>
        <span className="text-sm">{row.original.symbol}</span>
      </div>
    ),
  },
  {
    id: 'votingPower',
    accessorKey: 'votingPower',
    header: 'Vote Power',
    cell: ({ row }) => {
      const val = Number(row.original.votingPower)
      return (
        <span className="text-sm">
          {!isNaN(val) ? formatToSignificantDigits(val) : '—'}
        </span>
      )
    },
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
      if (!delegation) return <span className="text-sm text-legend">—</span>
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
        icon={Vote}
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
