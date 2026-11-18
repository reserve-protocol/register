import AddressHovercard, {
  AddressHovercardGroup,
} from '@/components/governance/address-hovercard'
import StackTokenLogo from '@/components/token-logo/stack-token-logo'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import EnsName from '@/components/utils/ens-name'
import { sortProposals } from '@/lib/proposal-sort'
import { cn } from '@/lib/utils'
import { ProposalVotingState } from '@/views/yield-dtf/governance/components/ProposalList'
import { Plural, Trans, useLingui } from '@lingui/react/macro'
import type { ColumnDef } from '@tanstack/react-table'
import TokenItem from 'components/token-item'
import dayjs from 'dayjs'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { walletAtom } from 'state/atoms'
import {
  getFolioRoute,
  getProposalTitle,
  getTokenRoute,
  parseDuration,
} from 'utils'
import { PROPOSAL_STATES, ROUTES, formatConstant } from 'utils/constants'
import {
  ExplorerCard,
  ExplorerHeader,
  ExplorerSubtitle,
} from '../kit/explorer-layout'
import ExplorerTable from '../kit/explorer-table'
import MobileField from '../kit/mobile-field'
import { TokenCell, YieldTokenCell } from '../kit/token-cell'
import { type ProposalToken, proposalSortAtom } from './atoms'
import Filters, { periodLabels } from './filters'
import useProposalsData, {
  type ProposalRecord,
  usePeriodFilter,
} from './use-proposals-data'

const BADGE_VARIANT: Record<string, string> = {
  [PROPOSAL_STATES.DEFEATED]: 'danger',
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: 'danger',
  [PROPOSAL_STATES.ACTIVE]: 'info',
  [PROPOSAL_STATES.QUEUED]: 'info',
  [PROPOSAL_STATES.SUCCEEDED]: 'info',
  [PROPOSAL_STATES.EXECUTED]: 'success',
  [PROPOSAL_STATES.CANCELED]: 'danger',
  [PROPOSAL_STATES.PENDING]: 'warning',
  [PROPOSAL_STATES.EXPIRED]: 'muted',
}

const badgeClasses: Record<string, string> = {
  danger: 'bg-destructive/15 text-destructive',
  info: 'bg-accent text-primary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  muted: 'bg-muted text-muted-foreground',
}

const getProposalRoute = (proposal: ProposalRecord) => {
  const route = `${ROUTES.GOVERNANCE_PROPOSAL}/${proposal.id}`

  if (proposal.type === 'index') {
    return getFolioRoute(proposal.tokenAddress, proposal.chain, route)
  }

  return getTokenRoute(proposal.tokenAddress, proposal.chain, route)
}

const SharedProposalTokens = ({ tokens }: { tokens: ProposalToken[] }) => {
  const [open, setOpen] = useState(false)
  const [primary, ...others] = tokens

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={0}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-fit items-center gap-1.5 font-semibold"
        >
          <StackTokenLogo tokens={tokens.slice(0, 3)} size={24} />
          <span>{primary.symbol}</span>
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
            +{others.length}
          </span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="start" className="flex w-auto flex-col gap-2 p-3">
        <span className="text-xs text-muted-foreground">
          <Trans>Shared governance</Trans>
        </span>
        {tokens.map((token) => (
          <TokenItem
            key={token.address}
            symbol={token.symbol}
            logo={token.logo}
            width={20}
          />
        ))}
      </HoverCardContent>
    </HoverCard>
  )
}

const ProposalTokenCell = ({ proposal }: { proposal: ProposalRecord }) => {
  if (proposal.tokens.length > 1) {
    return <SharedProposalTokens tokens={proposal.tokens} />
  }
  if (proposal.type === 'yield') {
    return (
      <YieldTokenCell
        symbol={proposal.tokenSymbol}
        address={proposal.tokenAddress}
        chain={proposal.chain}
      />
    )
  }
  return (
    <TokenCell
      symbol={proposal.tokenSymbol}
      address={proposal.tokenAddress}
      chain={proposal.chain}
      logo={proposal.tokenLogo}
    />
  )
}

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={cn(
      'inline-block shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold sm:px-3.5 sm:text-sm',
      badgeClasses[BADGE_VARIANT[status] || 'muted']
    )}
  >
    {formatConstant(status)}
  </span>
)

const ProposerButton = ({ proposal }: { proposal: ProposalRecord }) => {
  if (!proposal.proposer) return null

  return (
    <AddressHovercard
      address={proposal.proposer}
      surface="explorer_proposals"
      dtf={{
        address: proposal.tokenAddress,
        chainId: proposal.chain,
        type: proposal.type === 'yield' ? 'yield' : 'index',
        symbol: proposal.tokenSymbol,
        governor: proposal.type === 'index' ? proposal.governance : undefined,
      }}
      eventAt={+proposal.creationTime}
      className="font-medium text-foreground"
    >
      <EnsName address={proposal.proposer} className="truncate" />
    </AddressHovercard>
  )
}

const ProposalLink = ({ proposal }: { proposal: ProposalRecord }) => (
  <a
    href={getProposalRoute(proposal)}
    target="_blank"
    rel="noreferrer"
    className="font-medium text-foreground hover:text-primary"
  >
    <span className="capitalize">{getProposalTitle(proposal.description)}</span>
  </a>
)

const formatCreated = (proposal: ProposalRecord) =>
  dayjs.unix(+proposal.creationTime).format('MMM D, YYYY')

const VotingEnds = ({ proposal }: { proposal: ProposalRecord }) => {
  const { t } = useLingui()
  const { status, votingEndsIn } = proposal

  if (votingEndsIn === null || !Number.isFinite(votingEndsIn)) return <>—</>
  if (votingEndsIn <= 0) return <>{t`Ended`}</>
  if (status !== PROPOSAL_STATES.PENDING && status !== PROPOSAL_STATES.ACTIVE) {
    return <>—</>
  }
  return <>{parseDuration(votingEndsIn, { units: ['d', 'h'], round: true })}</>
}

const formatVoteChoice = (choice: string | null) =>
  choice ? choice.toLowerCase().replace(/^\w/, (char) => char.toUpperCase()) : null

const ProposalItem = ({ proposal }: { proposal: ProposalRecord }) => {
  const { t } = useLingui()
  const wallet = useAtomValue(walletAtom)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <ProposalTokenCell proposal={proposal} />
        <span className="ml-auto">
          <StatusBadge status={proposal.status} />
        </span>
      </div>
      <ProposalLink proposal={proposal} />
      <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-2">
        <MobileField label={<Trans>Proposed by</Trans>}>
          <ProposerButton proposal={proposal} />
        </MobileField>
        <MobileField label={<Trans>Created</Trans>} className="text-right">
          {formatCreated(proposal)}
        </MobileField>
        <MobileField label={<Trans>Voting ends</Trans>} className="text-right">
          <VotingEnds proposal={proposal} />
        </MobileField>
      </div>
      <ProposalVotingState data={proposal.votingState} />
      {wallet && (
        <span className="text-[13px] text-legend">
          <Trans>Your vote</Trans>{' '}
          <span className="font-medium text-foreground">
            {formatVoteChoice(proposal.userVote) || t`Not voted`}
          </span>
        </span>
      )}
    </div>
  )
}

const ExploreGovernance = () => {
  const { t } = useLingui()
  const { proposals, isLoading, isFetching } = useProposalsData()
  const sort = useAtomValue(proposalSortAtom)
  const period = usePeriodFilter()
  const wallet = useAtomValue(walletAtom)
  const data = useMemo(
    () => sortProposals(proposals, sort, (proposal) => proposal.status),
    [proposals, sort]
  )
  const proposers = useMemo(
    () => data.map((proposal) => proposal.proposer).filter(Boolean),
    [data]
  )

  const columns = useMemo<ColumnDef<ProposalRecord>[]>(
    () => [
      {
        id: 'token',
        header: t`Token`,
        cell: ({ row }) => <ProposalTokenCell proposal={row.original} />,
      },
      {
        id: 'proposal',
        header: t`Proposal`,
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col gap-0.5">
            <ProposalLink proposal={row.original} />
            <span className="flex items-center gap-1.5 text-[13px] text-legend">
              <Trans>by</Trans>
              <ProposerButton proposal={row.original} />
            </span>
            <ProposalVotingState data={row.original.votingState} />
          </div>
        ),
      },
      {
        id: 'created',
        header: t`Created`,
        meta: { className: 'whitespace-nowrap' },
        cell: ({ row }) => formatCreated(row.original),
      },
      {
        id: 'votingEnds',
        header: t`Voting ends`,
        meta: { className: 'whitespace-nowrap' },
        cell: ({ row }) => <VotingEnds proposal={row.original} />,
      },
      {
        id: 'status',
        header: t`Status`,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'userVote',
        header: t`Your vote`,
        meta: { className: 'whitespace-nowrap' },
        cell: ({ row }) => {
          if (!wallet) return <span className="text-legend">—</span>
          return formatVoteChoice(row.original.userVote) || t`Not voted`
        },
      },
    ],
    [wallet, t]
  )

  return (
    <>
      <ExplorerHeader
        title={<Trans>Proposals</Trans>}
        subtitle={
          !isLoading && (
            <ExplorerSubtitle
              value={
                <Plural value={data.length} one="# result" other="# results" />
              }
            >
              {period !== 'all' && t(periodLabels[period])}
            </ExplorerSubtitle>
          )
        }
      />
      <ExplorerCard>
        <Filters />
        <AddressHovercardGroup addresses={proposers}>
          <ExplorerTable
            data={data}
            columns={columns}
            getRowId={(proposal) => `${proposal.chain}-${proposal.id}`}
            renderItem={(proposal) => <ProposalItem proposal={proposal} />}
            pageSize={50}
            isLoading={isLoading}
            isFetching={isFetching}
            emptyLabel={<Trans>No proposals match these filters</Trans>}
            footerNote={
              !wallet && <Trans>Connect a wallet to see your votes</Trans>
            }
          />
        </AddressHovercardGroup>
      </ExplorerCard>
    </>
  )
}

export default ExploreGovernance
