import { getProposalState } from '@/lib/governance'
import { PROPOSAL_STATES } from '@/utils/constants'
import { atom } from 'jotai'
import { proposalDetailAtom, accountVotesAtom } from './atom'
import { indexGovernanceOverviewAtom, refetchTokenAtom } from '../../atoms'

const REFETCH_DELAY = 30_000

// Schedule a list refetch after subgraph has likely caught up
const scheduleListRefetch = (set: (atom: any, value: any) => void) => {
  setTimeout(() => {
    set(refetchTokenAtom, (t: number) => t + 1)
  }, REFETCH_DELAY)
}

// Map vote type integers to subgraph choice strings
const VOTE_CHOICE_MAP: Record<number, string> = {
  0: 'AGAINST',
  1: 'FOR',
  2: 'ABSTAIN',
}

// Map choice strings to weight field names
const WEIGHT_FIELD_MAP: Record<
  string,
  'forWeightedVotes' | 'againstWeightedVotes' | 'abstainWeightedVotes'
> = {
  FOR: 'forWeightedVotes',
  AGAINST: 'againstWeightedVotes',
  ABSTAIN: 'abstainWeightedVotes',
}

type VoteAction = { voteType: number; votePower: string; voter: string }

export const optimisticVoteActionAtom = atom(
  null,
  (get, set, action: VoteAction) => {
    const choice = VOTE_CHOICE_MAP[action.voteType]
    const weightField = WEIGHT_FIELD_MAP[choice]
    if (!choice || !weightField) return

    // 1. Update proposal detail
    set(proposalDetailAtom, (prev) => {
      if (!prev) return prev
      const updated = {
        ...prev,
        [weightField]: prev[weightField] + +action.votePower,
        votes: [
          ...prev.votes,
          { choice, voter: action.voter, weight: action.votePower },
        ],
      }
      const votingState = getProposalState(updated)
      return { ...updated, votingState, state: votingState.state }
    })

    // 2. Update account votes
    set(accountVotesAtom, { vote: choice, votePower: action.votePower })

    // 3. Update governance list
    const detail = get(proposalDetailAtom)
    set(indexGovernanceOverviewAtom, (prev) => {
      if (!prev || !detail) return prev
      return {
        ...prev,
        proposals: prev.proposals.map((p) =>
          p.id === detail.id
            ? { ...p, [weightField]: p[weightField] + +action.votePower }
            : p
        ),
      }
    })

    scheduleListRefetch(set)
  }
)

type QueueAction = { executionDelay: number; blockNumber: bigint }

export const optimisticQueueActionAtom = atom(
  null,
  (get, set, action: QueueAction) => {
    const now = Math.floor(Date.now() / 1000)

    set(proposalDetailAtom, (prev) => {
      if (!prev) return prev
      return {
        ...prev,
        votingState: {
          ...prev.votingState,
          state: PROPOSAL_STATES.QUEUED,
          deadline: action.executionDelay,
        },
        state: PROPOSAL_STATES.QUEUED,
        queueTime: now.toString(),
        queueBlock: Number(action.blockNumber),
        executionETA: now + action.executionDelay,
      }
    })

    const detail = get(proposalDetailAtom)
    set(indexGovernanceOverviewAtom, (prev) => {
      if (!prev || !detail) return prev
      return {
        ...prev,
        proposals: prev.proposals.map((p) =>
          p.id === detail.id ? { ...p, state: PROPOSAL_STATES.QUEUED } : p
        ),
      }
    })

    scheduleListRefetch(set)
  }
)

export const optimisticExecuteActionAtom = atom(null, (get, set) => {
  set(proposalDetailAtom, (prev) => {
    if (!prev) return prev
    return {
      ...prev,
      state: PROPOSAL_STATES.EXECUTED,
      votingState: {
        ...prev.votingState,
        state: PROPOSAL_STATES.EXECUTED,
        deadline: null,
      },
      executionTime: Math.floor(Date.now() / 1000).toString(),
    }
  })

  const detail = get(proposalDetailAtom)
  set(indexGovernanceOverviewAtom, (prev) => {
    if (!prev || !detail) return prev
    return {
      ...prev,
      proposals: prev.proposals.map((p) =>
        p.id === detail.id ? { ...p, state: PROPOSAL_STATES.EXECUTED } : p
      ),
    }
  })

  scheduleListRefetch(set)
})
