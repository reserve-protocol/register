import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import DataTable from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import { formatCurrency, getProposalTitle } from '@/utils'
import { formatConstant, PROPOSAL_STATES, ROUTES } from '@/utils/constants'
import { getFolioRoute, getTokenRoute } from '@/utils'
import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PortfolioProposal, PortfolioStakedRSR, PortfolioVoteLock } from '../types'

const BADGE_VARIANT: Record<string, string> = {
  [PROPOSAL_STATES.DEFEATED]: 'destructive',
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: 'destructive',
  [PROPOSAL_STATES.ACTIVE]: 'primary',
  [PROPOSAL_STATES.QUEUED]: 'primary',
  [PROPOSAL_STATES.EXECUTED]: 'success',
  [PROPOSAL_STATES.SUCCEEDED]: 'primary',
  [PROPOSAL_STATES.CANCELED]: 'destructive',
  [PROPOSAL_STATES.PENDING]: 'warning',
  [PROPOSAL_STATES.EXPIRED]: 'legend',
}

const columns: ColumnDef<PortfolioProposal, any>[] = [
  {
    id: 'dtf',
    header: 'DTF',
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
        <span className="font-medium text-sm">{row.original.dtfSymbol}</span>
      </div>
    ),
  },
  {
    id: 'title',
    header: 'Proposal',
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {getProposalTitle(row.original.description)}
      </span>
    ),
  },
  {
    id: 'votes',
    header: 'Votes',
    cell: ({ row }) => {
      const total =
        row.original.forVotes +
        row.original.againstVotes +
        row.original.abstainVotes
      const forPct = total > 0 ? (row.original.forVotes / total) * 100 : 0
      const againstPct =
        total > 0 ? (row.original.againstVotes / total) * 100 : 0
      return (
        <div className="flex items-center gap-1 text-sm">
          <span className="text-primary">{formatCurrency(forPct, 0)}%</span>
          <span className="text-legend">/</span>
          <span className="text-destructive">
            {formatCurrency(againstPct, 0)}%
          </span>
        </div>
      )
    },
    meta: { className: 'hidden sm:table-cell' },
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
            'rounded-full text-xs font-semibold py-1.5 border px-3 w-fit',
            `text-${BADGE_VARIANT[state] || 'legend'}`
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
    const staked = stakedRSR.flatMap((s) => s.activeProposals || [])
    const locked = voteLocks.flatMap((v) => v.activeProposals || [])
    return [...staked, ...locked].sort(
      (a, b) => b.creationTime - a.creationTime
    )
  }, [stakedRSR, voteLocks])

  if (!proposals.length) return null

  return (
    <div className="rounded-4xl bg-secondary">
      <div className="py-4 px-5">
        <h2 className="font-semibold text-xl text-primary dark:text-muted-foreground">
          Active Proposals
        </h2>
      </div>
      <div className="bg-card rounded-3xl m-1 mt-0">
        <DataTable
          columns={columns}
          data={proposals}
          onRowClick={(row) => {
            const basePath = row.isIndexDTF
              ? getFolioRoute(row.dtfAddress, row.chainId)
              : getTokenRoute(row.dtfAddress, row.chainId)
            navigate(`${basePath}${ROUTES.GOVERNANCE_PROPOSAL}/${row.id}`)
          }}
        />
      </div>
    </div>
  )
}

export default ActiveProposals
