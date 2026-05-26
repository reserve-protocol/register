import { cn } from '@/lib/utils'
import { formatPercentage, getProposalTitle, parseDuration } from '@/utils'
import { formatConstant, PROPOSAL_STATES } from '@/utils/constants'
import { Trans } from '@lingui/react/macro'
import type {
  IndexDtfProposalSummary,
  ProposalVotingState as IndexDtfProposalVotingState,
} from '@reserve-protocol/react-sdk'
import { Circle, HandFist, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'

type IProposalListItem = {
  proposal: IndexDtfProposalSummary
}

const BADGE_VARIANT = {
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

const VoteStateHeader = ({ data }: { data: IndexDtfProposalVotingState }) => {
  if (
    (data.state === PROPOSAL_STATES.ACTIVE ||
      data.state === PROPOSAL_STATES.QUEUED) &&
    data.deadline &&
    data.deadline > 0
  ) {
    return (
      <div className="flex items-center text-sm gap-1 mt-0.5">
        <span className="text-legend">
          {data.state === PROPOSAL_STATES.ACTIVE
            ? <Trans>Voting ends in:</Trans>
            : <Trans>Execution available in:</Trans>}
        </span>
        <span className="font-semibold">
          {parseDuration(data.deadline, {
            units: ['d', 'h'],
            round: true,
          })}
        </span>
      </div>
    )
  }

  return null
}

export const ProposalVotingState = ({
  data,
  isOptimistic,
}: {
  data: IndexDtfProposalVotingState
  isOptimistic?: boolean
}) => {
  if (data.state === PROPOSAL_STATES.PENDING && data.deadline) {
    return (
      <div className="flex items-center mt-2 text-xs sm:text-sm">
        <span className="text-legend block mr-1"><Trans>Voting starts in:</Trans></span>
        <span className="font-semibold">
          {parseDuration(data.deadline, {
            units: ['d', 'h', 'm'],
            round: true,
          })}
        </span>
      </div>
    )
  }

  const thresholdReached = isOptimistic ? !!data.vetoReached : data.quorum

  return (
    <>
      <VoteStateHeader data={data} />
      <div className="flex items-center mt-2 gap-2 text-xs sm:text-sm">
        <div>
          <span className="text-legend">
            {isOptimistic ? 'Veto?:' : 'Quorum?:'}
          </span>{' '}
          <span
            className={cn(
              'font-semibold',
              isOptimistic
                ? thresholdReached
                  ? 'text-destructive'
                  : 'text-success'
                : thresholdReached
                  ? 'text-success'
                  : 'text-warning'
            )}
          >
            {thresholdReached ? 'Yes' : 'No'}
          </span>
        </div>
        <Circle size={4} />
        <div className="flex items-center gap-1">
          <span className="text-legend">Votes:</span>
          <span className="font-semibold text-primary">
            {formatPercentage(data.for)}
          </span>
          /
          <span className="font-semibold text-destructive">
            {formatPercentage(data.against)}
          </span>
          /<span className="text-legend">{formatPercentage(data.abstain)}</span>
        </div>
      </div>
    </>
  )
}


const OptimisticBadge = () => (
  <div className='flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary text-xs'>
    <Rocket size={16} /> <span className='hidden sm:block'><Trans>Fast</Trans></span>
  </div>
)

const ContestedBadge = () => (
  <div className='flex items-center gap-1 rounded-full bg-[#F08E35]/10 px-2 py-1 text-[#F08E35] text-xs'>
    <HandFist size={16} /> <span className='hidden sm:block'><Trans>Contested</Trans></span>
  </div>
)

const ProposalTitle = ({ proposal }: IProposalListItem) => (
  <div className='flex items-start gap-3'>
    <h2 className="font-semibold text-xs sm:text-sm md:text-base mr-auto">
      {getProposalTitle(proposal.description)}
    </h2>
    {!!proposal.isOptimistic && <OptimisticBadge />}
    {!!proposal.wasChallenged && <ContestedBadge />}
  </div>
)

const ProposalListItem = ({
  proposal,
}: IProposalListItem) => {
  const proposalState = proposal.votingState
  const stateText = formatConstant(proposalState.state)

  return (
    <Link
      to={`proposal/${proposal.id}`}
      className="flex flex-col gap-2 p-4 [&:not(:last-child)]:border-b cursor-pointer transition-all hover:bg-border/50"
    >
      <ProposalTitle proposal={proposal} />

      <ProposalVotingState
        data={proposalState}
        isOptimistic={proposal.isOptimistic}
      />

      {/* <div
        className={cn(
          'rounded-full text-xs sm:text-sm font-semibold py-2 border px-3',
          `text-${BADGE_VARIANT[proposalState.state]}`
        )}
      >
        {stateText.includes('reached') ? 'Quorum' : stateText}
      </div> */}
    </Link>
  )
}

export default ProposalListItem