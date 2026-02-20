import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import DataTable from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import { formatCurrency, getProposalTitle } from '@/utils'
import { formatConstant, PROPOSAL_STATES, ROUTES } from '@/utils/constants'
import { getFolioRoute, getTokenRoute } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { ScrollText } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PortfolioProposal,
  PortfolioStakedRSR,
  PortfolioVoteLock,
} from '../types'
import { ExpandToggle, useExpandable } from './expand-toggle'
import SectionHeader from './section-header'

const STATUS_COLOR: Record<string, string> = {
  [PROPOSAL_STATES.DEFEATED]: 'text-destructive',
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: 'text-destructive',
  [PROPOSAL_STATES.ACTIVE]: 'text-success',
  [PROPOSAL_STATES.QUEUED]: 'text-success',
  [PROPOSAL_STATES.EXECUTED]: 'text-success',
  [PROPOSAL_STATES.SUCCEEDED]: 'text-primary',
  [PROPOSAL_STATES.CANCELED]: 'text-destructive',
  [PROPOSAL_STATES.PENDING]: 'text-[#ff8a00]',
  [PROPOSAL_STATES.EXPIRED]: 'text-legend',
}

const columns: ColumnDef<PortfolioProposal, any>[] = [
  {
    id: 'dtf',
    header: 'DTF Governed',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="relative flex-shrink-0">
          <TokenLogo
            symbol={row.original.dtfSymbol}
            address={row.original.dtfAddress}
            chain={row.original.chainId}
            size="lg"
          />
          <ChainLogo
            chain={row.original.chainId}
            className="absolute -bottom-0.5 -right-0.5"
            width={12}
            height={12}
          />
        </div>
        <span className="font-bold text-sm">{row.original.dtfSymbol}</span>
      </div>
    ),
  },
  {
    id: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const title = getProposalTitle(row.original.description)
      const forV = Number(row.original.forWeightedVotes) || 0
      const againstV = Number(row.original.againstWeightedVotes) || 0
      const abstainV = Number(row.original.abstainWeightedVotes) || 0
      const total = forV + againstV + abstainV
      const forPct = total > 0 ? (forV / total) * 100 : 0
      const againstPct = total > 0 ? (againstV / total) * 100 : 0
      const abstainPct = total > 0 ? (abstainV / total) * 100 : 0
      return (
        <div>
          <p className="font-bold text-sm text-primary">{title}</p>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-legend">
            <span>
              Quorum?{' '}
              <span className="font-medium text-success">Yes</span>
            </span>
            <span>
              Votes:{' '}
              <span className="text-primary font-medium">
                {formatCurrency(forPct, 0)}%
              </span>
              {' / '}
              <span className="text-destructive font-medium">
                {formatCurrency(againstPct, 0)}%
              </span>
              {' / '}
              <span>{formatCurrency(abstainPct, 0)}%</span>
            </span>
          </div>
        </div>
      )
    },
  },
  {
    id: 'date',
    header: 'Date Proposed',
    cell: ({ row }) => {
      const ts = Number(row.original.creationTime)
      if (!ts || isNaN(ts))
        return <span className="text-sm text-legend">—</span>
      return (
        <span className="text-sm">
          {dayjs(ts * 1000).format('MMM DD, YYYY')}
        </span>
      )
    },
    meta: { className: 'hidden md:table-cell' },
  },
  {
    id: 'state',
    header: 'Status',
    cell: ({ row }) => {
      const state = row.original.state
      const stateText = formatConstant(state)
      return (
        <div
          className={cn(
            'rounded-full text-xs font-medium py-1.5 border border-border px-3 w-fit',
            STATUS_COLOR[state] || 'text-legend'
          )}
        >
          {stateText.includes('reached') ? 'Quorum' : stateText}
        </div>
      )
    },
  },
]

const ActiveProposals = ({
  stakedRSR,
  voteLocks,
}: {
  stakedRSR: PortfolioStakedRSR[]
  voteLocks: PortfolioVoteLock[]
}) => {
  const navigate = useNavigate()

  const proposals: PortfolioProposal[] = useMemo(() => {
    const staked = stakedRSR.flatMap((s) =>
      (s.activeProposals || []).map((p) => ({
        ...p,
        dtfName: s.name,
        dtfSymbol: s.symbol,
        dtfAddress: s.address,
        chainId: s.chainId,
        isIndexDTF: false,
      }))
    )
    const locked = voteLocks.flatMap((v) =>
      (v.activeProposals || []).map((p) => ({
        ...p,
        dtfName: v.dtfs?.[0]?.name || v.stTokenSymbol,
        dtfSymbol: v.dtfs?.[0]?.symbol || v.stTokenSymbol,
        dtfAddress: v.dtfs?.[0]?.address || v.stTokenAddress,
        chainId: v.chainId,
        isIndexDTF: true,
      }))
    )
    return [...staked, ...locked].sort(
      (a, b) => Number(b.creationTime) - Number(a.creationTime)
    )
  }, [stakedRSR, voteLocks])

  const { displayData, expanded, toggle, hasMore, total } =
    useExpandable(proposals)

  if (!proposals.length) return null

  return (
    <div>
      <SectionHeader
        icon={ScrollText}
        title="Active Proposals"
        subtitle="View proposals from different DTFs you have vote-locked."
      />
      <div className="bg-card rounded-[20px] border border-border overflow-hidden">
        <DataTable
          columns={columns}
          data={displayData}
          onRowClick={(row) => {
            const basePath = row.isIndexDTF
              ? getFolioRoute(row.dtfAddress, row.chainId)
              : getTokenRoute(row.dtfAddress, row.chainId)
            navigate(`${basePath}${ROUTES.GOVERNANCE_PROPOSAL}/${row.id}`)
          }}
        />
        {hasMore && (
          <ExpandToggle expanded={expanded} total={total} onToggle={toggle} />
        )}
      </div>
    </div>
  )
}

export default ActiveProposals
