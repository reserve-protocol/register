import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getProposalState,
  PartialProposal,
  VotingState,
} from '@/lib/governance'
import { cn } from '@/lib/utils'
import { formatPercentage, getProposalTitle, parseDuration } from '@/utils'
import { formatConstant, PROPOSAL_STATES, ROUTES } from '@/utils/constants'
import { useAtomValue } from 'jotai'
import { Circle, PlusSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrackIndexDTFClick } from '../../hooks/useTrackIndexDTFPage'
import { governanceProposalsAtom } from '../atoms'

// The refresh button is a decent? idea but easily abused
const Header = () => {
  const { trackClick } = useTrackIndexDTFClick('overview', 'governance')
  // const [refetchTime, setRefetchToken] = useAtom(refetchTokenAtom)

  // const handleRefresh = () => {
  //   const currentTime = getCurrentTime()

  //   // Prevents button spamming
  //   if (refetchTime + 1 < currentTime) {
  //     setRefetchToken(currentTime)
  //   }
  // }

  return (
    <div className="py-4 px-5 flex items-center gap-2">
      <h1 className="font-bold text-xl text-primary mr-auto">
        Recent proposals
      </h1>
      {/* <Button variant="ghost" className="mr-auto" onClick={handleRefresh}>
        <RefreshCcw className="w-4 h-4" />
      </Button> */}
      <Link
        to={ROUTES.GOVERNANCE_PROPOSE}
        onClick={() => trackClick('create_proposal')}
      >
        <Button
          className="text-primary hover:text-primary gap-1"
          variant="ghost"
          size="sm"
        >
          <PlusSquare size={16} />
          Create proposal
        </Button>
      </Link>
    </div>
  )
}
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
        <span className="text-legend block mr-1">Voting starts in:</span>
        <span className="font-semibold">
          {parseDuration(data.deadline, {
            units: ['d', 'h', 'm'],
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
  [PROPOSAL_STATES.SUCCEEDED]: 'primary',
  [PROPOSAL_STATES.CANCELED]: 'destructive',
  [PROPOSAL_STATES.PENDING]: 'warning',
  [PROPOSAL_STATES.EXPIRED]: 'legend',
}

const ProposalListItem = ({ proposal }: { proposal: PartialProposal }) => {
  const proposalState = getProposalState(proposal)
  const [, forceUpdate] = useState({})

  // Re-render component every minute
  useEffect(() => {
    if (
      proposalState.state === PROPOSAL_STATES.ACTIVE ||
      proposalState.state === PROPOSAL_STATES.PENDING
    ) {
      const interval = setInterval(() => {
        forceUpdate({})
      }, 60 * 1000)

      return () => clearInterval(interval)
    }
  }, [proposalState.state])

  return (
    <Link
      to={`proposal/${proposal.id}`}
      className="flex items-center gap-2 p-4 [&:not(:last-child)]:border-b cursor-pointer transition-all hover:bg-border/50"
    >
      <div className="mr-auto">
        <h2 className="font-semibold">
          {getProposalTitle(proposal.description)}
        </h2>
        <ProposalVotingState data={proposalState} />
      </div>
      <div
        className={cn(
          'rounded-full text-sm font-semibold py-2 border px-3',
          `text-${BADGE_VARIANT[proposalState.state]}`
        )}
      >
        {formatConstant(proposalState.state)}
      </div>
    </Link>
  )
}

const ProposalList = () => {
  const data = useAtomValue(governanceProposalsAtom)

  if (!data) return <Skeleton className="h-[520px] w-full m-1 rounded-3xl" />

  return (
    <ScrollArea className="max-h-[520px] bg-card rounded-3xl m-1 mt-0">
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
    <div className="rounded-4xl bg-secondary">
      <Header />
      <ProposalList />
    </div>
  )
}

export default GovernanceProposalList
