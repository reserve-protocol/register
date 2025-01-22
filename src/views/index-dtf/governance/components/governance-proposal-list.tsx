import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getProposalState,
  PartialProposal,
  VotingState,
} from '@/lib/governance'
import { cn } from '@/lib/utils'
import { formatPercentage, parseDuration } from '@/utils'
import { formatConstant, PROPOSAL_STATES, ROUTES } from '@/utils/constants'
import { useAtomValue } from 'jotai'
import { Circle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { governanceProposalsAtom } from '../atoms'

const Header = () => (
  <div className="p-4 flex items-center gap-2">
    <h1 className="font-bold text-xl mr-auto">Recent proposals</h1>
    <Link to={ROUTES.GOVERNANCE_PROPOSE}>
      <Button size="sm">Create proposal</Button>
    </Link>
  </div>
)

const VoteStateHeader = ({ data }: { data: VotingState }) => {
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
            ? 'Voting ends in:'
            : 'Execution available in:'}
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

export const ProposalVotingState = ({ data }: { data: VotingState }) => {
  if (data.state === PROPOSAL_STATES.PENDING && data.deadline) {
    return (
      <div className="flex items-center mt-2 text-sm">
        Voting starts in:
        <span className="font-semibold">
          {parseDuration(data.deadline, {
            units: ['d', 'h'],
            round: true,
          })}
        </span>
      </div>
    )
  }

  return (
    <>
      <VoteStateHeader data={data} />
      <div className="flex items-center mt-2 gap-2 text-sm">
        <div>
          <span className="text-legend">Quorum?:</span>{' '}
          <span
            className={cn(
              'font-semibold',
              data.quorum ? 'text-success' : 'text-warning'
            )}
          >
            {data.quorum ? 'Yes' : 'No'}
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

const BADGE_VARIANT = {
  [PROPOSAL_STATES.DEFEATED]: 'destructive',
  [PROPOSAL_STATES.QUORUM_NOT_REACHED]: 'destructive',
  [PROPOSAL_STATES.ACTIVE]: 'primary',
  [PROPOSAL_STATES.QUEUED]: 'primary',
  [PROPOSAL_STATES.EXECUTED]: 'success',
  [PROPOSAL_STATES.CANCELED]: 'destructive',
  [PROPOSAL_STATES.PENDING]: 'legend',
}

const ProposalListItem = ({ proposal }: { proposal: PartialProposal }) => {
  const proposalState = getProposalState(proposal)

  return (
    <div
      role="button"
      className="flex items-center gap-2 p-4 [&:not(:last-child)]:border-b cursor-pointer transition-all hover:bg-border/50"
    >
      <div className="mr-auto">
        <h2 className="font-semibold">{proposal.description}</h2>
        <ProposalVotingState data={proposalState} />
      </div>
      <div
        className={cn(
          'rounded-full text-sm font-bold py-2 border px-3',
          `text-${BADGE_VARIANT[proposalState.state]}`
        )}
      >
        {formatConstant(proposalState.state)}
      </div>
    </div>
  )
}

const ProposalList = () => {
  const data = useAtomValue(governanceProposalsAtom)

  if (!data) return <Skeleton className="h-[520px] w-full m-1 rounded-3xl" />

  return (
    <ScrollArea className="max-h-[520px] bg-card rounded-3xl m-1">
      {data.length === 0 && (
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">No proposals found</p>
        </div>
      )}
      {data.map((proposal) => (
        <ProposalListItem key={proposal.id} proposal={proposal} />
      ))}
    </ScrollArea>
  )
}

const GovernanceProposalList = () => {
  return (
    <div className="rounded-3xl bg-secondary pb-0.5">
      <Header />
      <ProposalList />
    </div>
  )
}

export default GovernanceProposalList
