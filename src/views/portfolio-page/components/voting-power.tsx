import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import Copy from '@/components/ui/copy'
import DataTable from '@/components/ui/data-table'
import { formatCurrency, formatToSignificantDigits, getTokenRoute, shortenAddress } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { Vote } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PortfolioStakedRSR, PortfolioVoteLock } from '../types'
import { ExpandToggle, useExpandable } from './expand-toggle'
import GovernsCell from './governs-cell'
import SectionHeader from './section-header'

type VotingPowerRow =
  | ({ source: 'voteLock' } & PortfolioVoteLock)
  | ({ source: 'stakedRSR' } & PortfolioStakedRSR)

const columns: ColumnDef<VotingPowerRow, any>[] = [
  {
    id: 'dtf',
    header: 'DTF Governed',
    cell: ({ row }) => {
      const d = row.original
      if (d.source === 'voteLock') {
        return <GovernsCell dtfs={d.dtfs} chainId={d.chainId} />
      }
      return (
        <Link
          to={getTokenRoute(d.address, d.chainId)}
          className="text-sm text-primary hover:underline"
          target="_blank"
          onClick={(e) => e.stopPropagation()}
        >
          {d.symbol}
        </Link>
      )
    },
  },
  {
    id: 'govToken',
    header: 'Governance Token',
    cell: ({ row }) => {
      const d = row.original
      if (d.source === 'voteLock') {
        return (
          <div className="flex items-center gap-2">
            <div className="relative flex-shrink-0">
              <TokenLogo
                symbol={d.underlying.symbol}
                address={d.underlying.address}
                chain={d.chainId}
                size="md"
              />
              <ChainLogo
                chain={d.chainId}
                className="absolute -bottom-0.5 -right-0.5"
                width={10}
                height={10}
              />
            </div>
            <span className="text-sm">{d.symbol}</span>
          </div>
        )
      }
      return (
        <div className="flex items-center gap-2">
          <div className="relative flex-shrink-0">
            <TokenLogo symbol="RSR" size="md" />
            <ChainLogo
              chain={d.chainId}
              className="absolute -bottom-0.5 -right-0.5"
              width={10}
              height={10}
            />
          </div>
          <span className="text-sm">{d.symbol.toLowerCase()}RSR</span>
        </div>
      )
    },
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
    id: 'votingWeight',
    header: 'Vote Weight',
    cell: ({ row }) => {
      const d = row.original
      const weight = d.source === 'voteLock' ? d.votingWeight : d.votingWeight
      return (
        <span className="text-sm">
          {weight != null ? `${formatCurrency(weight * 100, 2)}%` : '—'}
        </span>
      )
    },
  },
  {
    id: 'voterAddress',
    header: 'Vote-locker Address',
    cell: ({ row }) => {
      const d = row.original
      const addr = d.source === 'voteLock' ? d.stTokenAddress : d.stRSRAddress
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
      const d = row.original
      const delegation = d.source === 'voteLock' ? d.delegation : d.delegate
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

const VotingPower = ({
  voteLocks,
  stakedRSR,
}: {
  voteLocks: PortfolioVoteLock[]
  stakedRSR: PortfolioStakedRSR[]
}) => {
  const mergedData: VotingPowerRow[] = [
    ...voteLocks.map((v) => ({ source: 'voteLock' as const, ...v })),
    ...stakedRSR.map((s) => ({ source: 'stakedRSR' as const, ...s })),
  ]

  const { displayData, expanded, toggle, hasMore, total } =
    useExpandable(mergedData)

  if (!mergedData.length) return null

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
