import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatConstant, PROPOSAL_STATES, ROUTES } from '@/utils/constants'
import { data, Link } from 'react-router-dom'
import {
  getProposalState,
  PartialProposal,
  VotingState,
} from '@/lib/governance'
import { formatPercentage, parseDuration } from '@/utils'
import { Circle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const useProposals = () => {
  const mockProposals: PartialProposal[] = [
    {
      id: '1',
      description: 'Update collateral requirements for ETH lending',
      creationTime: Math.floor(Date.now() / 1000) - 86400 * 7, // 7 days ago
      state: PROPOSAL_STATES.ACTIVE,
      forWeightedVotes: 1500000,
      abstainWeightedVotes: 250000,
      againstWeightedVotes: 750000,
      executionETA: Math.floor(Date.now() / 1000) + 86400 * 3,
      quorumVotes: 2000000,
      voteStart: Math.floor(Date.now() / 1000) - 86400 * 5,
      voteEnd: Math.floor(Date.now() / 1000) + 86400 * 2,
    },
    {
      id: '2',
      description: 'Implement new liquidation mechanism',
      creationTime: Math.floor(Date.now() / 1000) - 86400 * 14,
      state: PROPOSAL_STATES.EXECUTED,
      forWeightedVotes: 2500000,
      abstainWeightedVotes: 100000,
      againstWeightedVotes: 400000,
      executionETA: Math.floor(Date.now() / 1000) - 86400 * 2,
      quorumVotes: 2000000,
      voteStart: Math.floor(Date.now() / 1000) - 86400 * 12,
      voteEnd: Math.floor(Date.now() / 1000) - 86400 * 5,
    },
    {
      id: '3',
      description: 'Add USDC as supported collateral',
      creationTime: Math.floor(Date.now() / 1000) - 86400 * 21,
      state: PROPOSAL_STATES.DEFEATED,
      forWeightedVotes: 900000,
      abstainWeightedVotes: 100000,
      againstWeightedVotes: 1500000,
      executionETA: 0,
      quorumVotes: 2000000,
      voteStart: Math.floor(Date.now() / 1000) - 86400 * 19,
      voteEnd: Math.floor(Date.now() / 1000) - 86400 * 12,
    },
    {
      id: '4',
      description: 'Adjust protocol fees',
      creationTime: Math.floor(Date.now() / 1000) - 86400 * 2,
      state: PROPOSAL_STATES.PENDING,
      forWeightedVotes: 0,
      abstainWeightedVotes: 0,
      againstWeightedVotes: 0,
      executionETA: 0,
      quorumVotes: 2000000,
      voteStart: Math.floor(Date.now() / 1000) + 86400,
      voteEnd: Math.floor(Date.now() / 1000) + 86400 * 8,
    },
    {
      id: '5',
      description: 'Upgrade governance parameters',
      creationTime: Math.floor(Date.now() / 1000) - 86400 * 28,
      state: PROPOSAL_STATES.QUEUED,
      forWeightedVotes: 2200000,
      abstainWeightedVotes: 300000,
      againstWeightedVotes: 500000,
      executionETA: Math.floor(Date.now() / 1000) + 86400,
      quorumVotes: 2000000,
      voteStart: Math.floor(Date.now() / 1000) - 86400 * 26,
      voteEnd: Math.floor(Date.now() / 1000) - 86400 * 19,
    },
    {
      id: '6',
      description: 'Add new market makers',
      creationTime: Math.floor(Date.now() / 1000) - 86400 * 35,
      state: PROPOSAL_STATES.EXECUTED,
      forWeightedVotes: 2800000,
      abstainWeightedVotes: 100000,
      againstWeightedVotes: 100000,
      executionETA: Math.floor(Date.now() / 1000) - 86400 * 20,
      quorumVotes: 2000000,
      voteStart: Math.floor(Date.now() / 1000) - 86400 * 33,
      voteEnd: Math.floor(Date.now() / 1000) - 86400 * 26,
    },
    {
      id: '7',
      description: 'Update oracle implementation',
      creationTime: Math.floor(Date.now() / 1000) - 86400 * 42,
      state: PROPOSAL_STATES.EXECUTED,
      forWeightedVotes: 2600000,
      abstainWeightedVotes: 200000,
      againstWeightedVotes: 200000,
      executionETA: Math.floor(Date.now() / 1000) - 86400 * 27,
      quorumVotes: 2000000,
      voteStart: Math.floor(Date.now() / 1000) - 86400 * 40,
      voteEnd: Math.floor(Date.now() / 1000) - 86400 * 33,
    },
    {
      id: '8',
      description: 'Implement emergency shutdown mechanism',
      creationTime: Math.floor(Date.now() / 1000) - 86400 * 49,
      state: PROPOSAL_STATES.CANCELED,
      forWeightedVotes: 500000,
      abstainWeightedVotes: 100000,
      againstWeightedVotes: 400000,
      executionETA: 0,
      quorumVotes: 2000000,
      voteStart: Math.floor(Date.now() / 1000) - 86400 * 47,
      voteEnd: Math.floor(Date.now() / 1000) - 86400 * 40,
    },
    {
      id: '9',
      description: 'Add new risk parameters',
      creationTime: Math.floor(Date.now() / 1000) - 86400 * 56,
      state: PROPOSAL_STATES.EXECUTED,
      forWeightedVotes: 2400000,
      abstainWeightedVotes: 300000,
      againstWeightedVotes: 300000,
      executionETA: Math.floor(Date.now() / 1000) - 86400 * 41,
      quorumVotes: 2000000,
      voteStart: Math.floor(Date.now() / 1000) - 86400 * 54,
      voteEnd: Math.floor(Date.now() / 1000) - 86400 * 47,
    },
    {
      id: '10',
      description: 'Update interest rate model',
      creationTime: Math.floor(Date.now() / 1000) - 86400 * 63,
      state: PROPOSAL_STATES.EXECUTED,
      forWeightedVotes: 2700000,
      abstainWeightedVotes: 200000,
      againstWeightedVotes: 100000,
      executionETA: Math.floor(Date.now() / 1000) - 86400 * 48,
      quorumVotes: 2000000,
      voteStart: Math.floor(Date.now() / 1000) - 86400 * 61,
      voteEnd: Math.floor(Date.now() / 1000) - 86400 * 54,
    },
  ]

  return {
    data: mockProposals,
    loading: false,
    error: false,
  }
}

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
  const { data, loading, error } = useProposals()

  return (
    <ScrollArea className="h-[520px] bg-card rounded-3xl m-1">
      {data.map((proposal) => (
        <ProposalListItem key={proposal.id} proposal={proposal} />
      ))}
    </ScrollArea>
  )
}

const GovernanceProposalList = () => {
  return (
    <div className="rounded-3xl bg-secondary">
      <Header />
      <ProposalList />
    </div>
  )
}

export default GovernanceProposalList
