import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import DataTable from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import {
  formatCurrency,
  getFolioRoute,
  getProposalTitle,
  getTokenRoute,
  parseDuration,
} from '@/utils'
import { formatConstant, PROPOSAL_STATES, ROUTES } from '@/utils/constants'
import { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import { ScrollText } from 'lucide-react'
import { ActiveProposalRow, portfolioActiveProposalsAtom } from '../atoms'
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

type ProposalRow = ActiveProposalRow

const columns: ColumnDef<ProposalRow, any>[] = [
  {
    id: 'dtf',
    header: 'DTF Governed',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <TokenLogoWithChain
          symbol={row.original.dtfSymbol}
          address={row.original.dtfAddress}
          chain={row.original.chainId}
        />
        <span className="font-bold text-sm">{row.original.dtfSymbol}</span>
      </div>
    ),
  },
  {
    id: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const title = getProposalTitle(row.original.description)
      const voting = row.original.voting

      if (voting.state === PROPOSAL_STATES.PENDING && voting.deadline) {
        return (
          <div>
            <p className="font-bold text-sm text-primary">{title}</p>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-legend">
              <span>Voting starts in:</span>
              <span className="font-semibold text-foreground">
                {parseDuration(voting.deadline, {
                  units: ['d', 'h', 'm'],
                  round: true,
                })}
              </span>
            </div>
          </div>
        )
      }

      const forV = +row.original.forWeightedVotes || 0
      const abstainV = +row.original.abstainWeightedVotes || 0
      const quorumMet = forV + abstainV >= (+row.original.quorumVotes || 0)
      return (
        <div>
          <p className="font-bold text-sm text-primary">{title}</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 mt-0.5 text-xs text-legend">
            <span>
              Quorum?{' '}
              <span
                className={cn(
                  'font-medium',
                  quorumMet ? 'text-success' : 'text-destructive'
                )}
              >
                {quorumMet ? 'Yes' : 'No'}
              </span>
            </span>
            {(voting.for > 0 || voting.against > 0 || voting.abstain > 0) && (
              <span>
                Votes:{' '}
                <span className="text-primary font-medium">
                  {formatCurrency(voting.for, 0)}%
                </span>
                {' / '}
                <span className="text-destructive font-medium">
                  {formatCurrency(voting.against, 0)}%
                </span>
                {' / '}
                <span>{formatCurrency(voting.abstain, 0)}%</span>
              </span>
            )}
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
      const { state } = row.original.voting
      const stateText = formatConstant(state)
      return (
        <div
          className={cn(
            'rounded-full text-xs font-medium py-1.5 border border-border px-3 w-fit',
            STATUS_COLOR[state] || 'text-legend'
          )}
        >
          {stateText}
        </div>
      )
    },
  },
]

const ActiveProposals = () => {
  const proposals = useAtomValue(portfolioActiveProposalsAtom)

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
            const path = row.isIndexDTF
              ? getFolioRoute(
                  row.dtfAddress,
                  row.chainId,
                  `${ROUTES.GOVERNANCE_PROPOSAL}/${row.id}`
                )
              : getTokenRoute(
                  row.dtfAddress,
                  row.chainId,
                  `${ROUTES.GOVERNANCE_PROPOSAL}/${row.id}`
                )
            window.open(path, '_blank')
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
