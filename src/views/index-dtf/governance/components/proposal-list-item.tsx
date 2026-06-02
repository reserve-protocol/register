import ProposalStatusBar from '@/components/proposal-status-bar'
import { cn } from '@/lib/utils'
import { formatPercentage, getProposalTitle, parseDuration } from '@/utils'
import { PROPOSAL_STATES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import type {
  IndexDtfProposalSummary
} from '@reserve-protocol/react-sdk'
import { Ban, CheckCircle2, Clock, FileX, ThumbsDown, ThumbsUp, UserRoundCheck, UserRoundX } from 'lucide-react'
import { Link } from 'react-router-dom'
import useProposalStages from '../hooks/use-proposal-stages'
import ContestedBadge from './contest-badge'
import OptimisticBadge from './optimistic-badge'

type IProposalListItem = {
  proposal: IndexDtfProposalSummary
}

const FINISHED_STATES = new Set([PROPOSAL_STATES.CANCELED, PROPOSAL_STATES.DEFEATED, PROPOSAL_STATES.EXECUTED, PROPOSAL_STATES.EXPIRED, PROPOSAL_STATES.QUORUM_NOT_REACHED])
const ACTIVE_STATES = new Set([PROPOSAL_STATES.PENDING, PROPOSAL_STATES.ACTIVE, PROPOSAL_STATES.SUCCEEDED, PROPOSAL_STATES.QUEUED])

const ActiveProposalState = ({ state, deadline }: { state: string, deadline: number }) => {
  const description = {
    [PROPOSAL_STATES.PENDING]: <Trans>Voting starts in:</Trans>,
    [PROPOSAL_STATES.ACTIVE]: <Trans>Voting ends in:</Trans>,
    [PROPOSAL_STATES.QUEUED]: <Trans>Execution available in:</Trans>
  }
  const timeLeft = parseDuration(deadline, {
    units: ['d', 'h', 'm'],
    round: true,
  })

  return (
    <div className="flex items-center text-xs gap-1 mt-1 mr-auto">
      <span className="text-legend">
        {description[state]}
      </span>
      <span className="font-semibold text-primary">
        {timeLeft}
      </span>
    </div>
  )
}

const ProposalStateIcon = ({ state }: { state: string }) => {
  // Clock icon, indicates action needs to be taked
  if (state === PROPOSAL_STATES.SUCCEEDED || state === PROPOSAL_STATES.QUEUED) {
    return <Clock size={14} className='text-primary' />
  }

  // Executed => success!
  if (state === PROPOSAL_STATES.EXECUTED) {
    return <CheckCircle2 size={14} className='text-success' />
  }

  return <FileX size={14} className="text-destructive" />
}

const ProposalState = ({ proposal }: IProposalListItem) => {
  if (ACTIVE_STATES.has(proposal.state) && proposal.votingState.deadline && proposal.votingState.deadline > 0) {
    return <ActiveProposalState state={proposal.state} deadline={proposal.votingState.deadline} />
  }

  const STATE_LABEL = {
    [PROPOSAL_STATES.SUCCEEDED]: <Trans>Pending queue</Trans>,
    [PROPOSAL_STATES.QUEUED]: <Trans>Pending execution</Trans>,
    [PROPOSAL_STATES.EXECUTED]: <Trans>Executed</Trans>,
    [PROPOSAL_STATES.CANCELED]: <Trans>Proposal was canceled</Trans>,
    [PROPOSAL_STATES.DEFEATED]: <Trans>Proposal was defeated</Trans>,
    [PROPOSAL_STATES.EXPIRED]: <Trans>Proposal expired</Trans>,
    [PROPOSAL_STATES.QUORUM_NOT_REACHED]: <Trans>Quorum not reached</Trans>
  }

  return (
    <div className='flex items-center gap-1 text-xs mr-auto'>
      <ProposalStateIcon state={proposal.state} />
      <strong>{STATE_LABEL[proposal.state] || 'Unknown'}</strong>
      {PROPOSAL_STATES.EXECUTED === proposal.state && (
        <span className='hidden md:block text-legend'>
          <Trans>
            on {new Date(Number(proposal.executionTime) * 1000).toLocaleString(undefined, {
              month: '2-digit',
              day: '2-digit',
              year: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }).replace(',', '').replace(/(\d{2})\/(\d{2})\/(\d{2})/, '$1/$2/$3 at')}
          </Trans>

        </span>
      )}
    </div>
  )
}

const ProposalVoteState = ({ proposal }: IProposalListItem) => {
  const isFinished = FINISHED_STATES.has(proposal.state)
  const success = isFinished ? 'text-legend' : 'text-success'
  const fail = isFinished ? 'text-legend' : 'text-destructive'

  if (proposal.isOptimistic) {
    return <div className='flex items-center gap-2 text-xs'>
      <ThumbsDown size={14} className={fail} /> <strong className={cn(fail, 'mr-1')}>{formatPercentage(Math.min(proposal.votingState.against, 100))}</strong>
    </div>
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {proposal.state === PROPOSAL_STATES.ACTIVE && (
        <div className='mr-1'>{proposal.votingState.quorum ? <UserRoundCheck size={14} className='text-success' /> : <UserRoundX size={14} className='text-destructive' />}</div>
      )}
      <ThumbsUp size={14} className={success} /> <strong className={cn(success, 'mr-1')}>{formatPercentage(proposal.votingState.for)}</strong>
      <ThumbsDown size={14} className={fail} /> <strong className={cn(fail, 'mr-1')}>{formatPercentage(proposal.votingState.against)}</strong>
      <Ban size={14} className='text-legend' /> <span className={cn(isFinished && 'text-legend')}>{formatPercentage(proposal.votingState.abstain)}</span>
    </div>
  )
}

const ProposalTitle = ({ proposal }: IProposalListItem) => (
  <div className='flex items-start gap-3'>
    <h2 className="font-semibold text-sm md:text-base mr-auto">
      {getProposalTitle(proposal.description)}
    </h2>
    {!!proposal.isOptimistic && <OptimisticBadge />}
    {!!proposal.wasChallenged && <ContestedBadge />}
  </div>
)

const ProposalProgress = ({ proposal }: IProposalListItem) => {
  const stages = useProposalStages(proposal)
  if (FINISHED_STATES.has(proposal.state)) return null

  return (
    <ProposalStatusBar className='my-1' stages={stages} />
  )
}

const ProposalListItem = ({
  proposal,
}: IProposalListItem) => (
  <Link
    to={`proposal/${proposal.id}`}
    className="flex flex-col gap-2 p-4 [&:not(:last-child)]:border-b cursor-pointer transition-all hover:bg-border/50"
  >
    <ProposalTitle proposal={proposal} />
    <ProposalProgress proposal={proposal} />
    <div className='flex items-center'>
      <ProposalState proposal={proposal} />
      <ProposalVoteState proposal={proposal} />
    </div>
  </Link>
)

export default ProposalListItem