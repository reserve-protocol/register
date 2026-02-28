import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'jotai'
import { PROPOSAL_STATES } from '@/utils/constants'
import { ProposalDetail } from '@/lib/governance'
import { proposalDetailAtom, accountVotesAtom } from '../atom'
import { indexGovernanceOverviewAtom } from '../../../atoms'
import {
  optimisticVoteActionAtom,
  optimisticQueueActionAtom,
  optimisticExecuteActionAtom,
} from '../optimistic-actions'
import { Address } from 'viem'

const makeProposalDetail = (
  overrides: Partial<ProposalDetail> = {}
): ProposalDetail => ({
  id: '1',
  timelockId: '0x1',
  description: 'Test proposal',
  creationTime: 1000,
  creationBlock: 1,
  state: PROPOSAL_STATES.ACTIVE,
  forWeightedVotes: 100,
  abstainWeightedVotes: 10,
  againstWeightedVotes: 50,
  quorumVotes: 100,
  voteStart: 2000,
  voteEnd: 3000,
  proposer: { address: '0x1' as Address },
  calldatas: ['0x1' as `0x${string}`],
  targets: ['0x2' as Address],
  votes: [],
  governor: '0x3' as Address,
  forDelegateVotes: '0',
  abstainDelegateVotes: '0',
  againstDelegateVotes: '0',
  votingState: {
    state: PROPOSAL_STATES.ACTIVE,
    deadline: 500,
    quorum: true,
    for: 62.5,
    against: 31.25,
    abstain: 6.25,
  },
  ...overrides,
})

describe('optimistic action atoms', () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    store = createStore()
  })

  describe('optimisticVoteActionAtom', () => {
    it('adds FOR vote to forWeightedVotes', () => {
      store.set(proposalDetailAtom, makeProposalDetail())

      store.set(optimisticVoteActionAtom, {
        voteType: 1,
        votePower: '50',
        voter: '0xVoter',
      })

      const proposal = store.get(proposalDetailAtom)!
      expect(proposal.forWeightedVotes).toBe(150)
    })

    it('adds AGAINST vote to againstWeightedVotes', () => {
      store.set(proposalDetailAtom, makeProposalDetail())

      store.set(optimisticVoteActionAtom, {
        voteType: 0,
        votePower: '25',
        voter: '0xVoter',
      })

      const proposal = store.get(proposalDetailAtom)!
      expect(proposal.againstWeightedVotes).toBe(75)
    })

    it('adds ABSTAIN vote to abstainWeightedVotes', () => {
      store.set(proposalDetailAtom, makeProposalDetail())

      store.set(optimisticVoteActionAtom, {
        voteType: 2,
        votePower: '30',
        voter: '0xVoter',
      })

      const proposal = store.get(proposalDetailAtom)!
      expect(proposal.abstainWeightedVotes).toBe(40)
    })

    it('updates accountVotesAtom with choice string', () => {
      store.set(proposalDetailAtom, makeProposalDetail())

      store.set(optimisticVoteActionAtom, {
        voteType: 1,
        votePower: '50',
        voter: '0xVoter',
      })

      const accountVotes = store.get(accountVotesAtom)
      expect(accountVotes.vote).toBe('FOR')
      expect(accountVotes.votePower).toBe('50')
    })

    it('updates governance list atom for matching proposal', () => {
      const detail = makeProposalDetail()
      store.set(proposalDetailAtom, detail)
      store.set(indexGovernanceOverviewAtom, {
        proposals: [
          { ...detail, id: '1' },
          { ...detail, id: '2', forWeightedVotes: 0 },
        ],
        delegates: [],
        voteSupply: 1000,
        delegatesCount: 5,
        proposalCount: 2,
      })

      store.set(optimisticVoteActionAtom, {
        voteType: 1,
        votePower: '50',
        voter: '0xVoter',
      })

      const overview = store.get(indexGovernanceOverviewAtom)!
      expect(overview.proposals[0].forWeightedVotes).toBe(150) // updated
      expect(overview.proposals[1].forWeightedVotes).toBe(0) // untouched
    })

    it('keeps .state and .votingState.state in sync', () => {
      store.set(proposalDetailAtom, makeProposalDetail())

      store.set(optimisticVoteActionAtom, {
        voteType: 1,
        votePower: '50',
        voter: '0xVoter',
      })

      const proposal = store.get(proposalDetailAtom)!
      expect(proposal.state).toBe(proposal.votingState.state)
    })

    it('no-op on undefined proposal', () => {
      store.set(proposalDetailAtom, undefined)

      store.set(optimisticVoteActionAtom, {
        voteType: 1,
        votePower: '50',
        voter: '0xVoter',
      })

      expect(store.get(proposalDetailAtom)).toBeUndefined()
    })
  })

  describe('optimisticQueueActionAtom', () => {
    it('sets state to QUEUED with executionETA', () => {
      store.set(
        proposalDetailAtom,
        makeProposalDetail({ state: PROPOSAL_STATES.SUCCEEDED })
      )

      store.set(optimisticQueueActionAtom, {
        executionDelay: 3600,
        blockNumber: 100n,
      })

      const proposal = store.get(proposalDetailAtom)!
      expect(proposal.state).toBe(PROPOSAL_STATES.QUEUED)
      expect(proposal.votingState.state).toBe(PROPOSAL_STATES.QUEUED)
      expect(proposal.votingState.deadline).toBe(3600)
      expect(proposal.queueBlock).toBe(100)
      expect(proposal.executionETA).toBeGreaterThan(0)
    })

    it('updates governance list', () => {
      const detail = makeProposalDetail({
        state: PROPOSAL_STATES.SUCCEEDED,
      })
      store.set(proposalDetailAtom, detail)
      store.set(indexGovernanceOverviewAtom, {
        proposals: [detail],
        delegates: [],
        voteSupply: 1000,
        delegatesCount: 5,
        proposalCount: 1,
      })

      store.set(optimisticQueueActionAtom, {
        executionDelay: 3600,
        blockNumber: 100n,
      })

      const overview = store.get(indexGovernanceOverviewAtom)!
      expect(overview.proposals[0].state).toBe(PROPOSAL_STATES.QUEUED)
    })
  })

  describe('optimisticExecuteActionAtom', () => {
    it('sets state to EXECUTED with executionTime', () => {
      store.set(
        proposalDetailAtom,
        makeProposalDetail({ state: PROPOSAL_STATES.QUEUED })
      )

      store.set(optimisticExecuteActionAtom)

      const proposal = store.get(proposalDetailAtom)!
      expect(proposal.state).toBe(PROPOSAL_STATES.EXECUTED)
      expect(proposal.votingState.state).toBe(PROPOSAL_STATES.EXECUTED)
      expect(proposal.votingState.deadline).toBeNull()
      expect(proposal.executionTime).toBeDefined()
    })

    it('updates governance list', () => {
      const detail = makeProposalDetail({ state: PROPOSAL_STATES.QUEUED })
      store.set(proposalDetailAtom, detail)
      store.set(indexGovernanceOverviewAtom, {
        proposals: [detail],
        delegates: [],
        voteSupply: 1000,
        delegatesCount: 5,
        proposalCount: 1,
      })

      store.set(optimisticExecuteActionAtom)

      const overview = store.get(indexGovernanceOverviewAtom)!
      expect(overview.proposals[0].state).toBe(PROPOSAL_STATES.EXECUTED)
    })

    it('no-op on undefined proposal', () => {
      store.set(proposalDetailAtom, undefined)

      store.set(optimisticExecuteActionAtom)

      expect(store.get(proposalDetailAtom)).toBeUndefined()
    })
  })
})
