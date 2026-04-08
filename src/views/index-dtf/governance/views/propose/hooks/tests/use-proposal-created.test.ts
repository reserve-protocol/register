import { describe, it, expect } from 'vitest'
import { getProposalState, type ProposalDetail } from '@/lib/governance'

// WHY: We test the core logic of use-proposal-created without React hooks.
// The hook itself is a thin wrapper (useEffect + useNavigate + useSetAtom).
// What matters: the optimistic ProposalDetail is built correctly and
// getProposalState computes the right state for new proposals.

const TEST_PROPOSER = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const
const TEST_GOVERNOR = '0x5a3e4b2c1a9f8d7e6c5b4a3f2e1d0c9b8a7f6e5d' as const
const TEST_TARGET = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' as const

function buildOptimisticProposal(overrides: {
  voteStart: number
  voteEnd: number
  proposalId?: bigint
}): ProposalDetail {
  const id = (overrides.proposalId ?? 12345n).toString()

  const proposal: ProposalDetail = {
    id,
    timelockId:
      '0x' +
      (overrides.proposalId ?? 12345n).toString(16).padStart(64, '0'),
    description: '# Test Proposal\nA test proposal description',
    creationTime: Math.floor(Date.now() / 1000),
    creationBlock: 1000,
    state: 'PENDING',
    voteStart: overrides.voteStart,
    voteEnd: overrides.voteEnd,
    forWeightedVotes: 0,
    againstWeightedVotes: 0,
    abstainWeightedVotes: 0,
    quorumVotes: 0,
    calldatas: ['0xabcdef01' as `0x${string}`],
    targets: [TEST_TARGET],
    proposer: { address: TEST_PROPOSER },
    votes: [],
    governor: TEST_GOVERNOR,
    forDelegateVotes: '0',
    abstainDelegateVotes: '0',
    againstDelegateVotes: '0',
    votingState: {
      state: 'PENDING',
      deadline: null,
      quorum: false,
      for: 0,
      against: 0,
      abstain: 0,
    },
  }

  proposal.votingState = getProposalState(proposal)
  proposal.state = proposal.votingState.state

  return proposal
}

describe('use-proposal-created logic', () => {
  describe('optimistic ProposalDetail construction', () => {
    it('PENDING when voting has not started yet', () => {
      const now = Math.floor(Date.now() / 1000)
      const proposal = buildOptimisticProposal({
        voteStart: now + 86400,
        voteEnd: now + 86400 + 259200,
      })

      expect(proposal.state).toBe('PENDING')
      expect(proposal.votingState.deadline).toBeGreaterThan(0)
      expect(proposal.forWeightedVotes).toBe(0)
      expect(proposal.votes).toHaveLength(0)
    })

    it('ACTIVE when voting period has started', () => {
      const now = Math.floor(Date.now() / 1000)
      const proposal = buildOptimisticProposal({
        voteStart: now - 3600, // started 1 hour ago
        voteEnd: now + 259200, // ends in 3 days
      })

      expect(proposal.state).toBe('ACTIVE')
      expect(proposal.votingState.deadline).toBeGreaterThan(0)
    })

    it('preserves all required ProposalDetail fields', () => {
      const now = Math.floor(Date.now() / 1000)
      const proposal = buildOptimisticProposal({
        proposalId: 99999n,
        voteStart: now + 86400,
        voteEnd: now + 86400 + 259200,
      })

      // Core fields
      expect(proposal.id).toBe('99999')
      expect(proposal.timelockId).toMatch(/^0x/)
      expect(proposal.description).toBe(
        '# Test Proposal\nA test proposal description'
      )
      expect(proposal.governor).toBe(TEST_GOVERNOR)
      expect(proposal.proposer.address).toBe(TEST_PROPOSER)
      expect(proposal.targets).toEqual([TEST_TARGET])
      expect(proposal.calldatas).toEqual(['0xabcdef01'])

      // Vote fields initialized to zero
      expect(proposal.forWeightedVotes).toBe(0)
      expect(proposal.againstWeightedVotes).toBe(0)
      expect(proposal.abstainWeightedVotes).toBe(0)
      expect(proposal.quorumVotes).toBe(0)
      expect(proposal.forDelegateVotes).toBe('0')
    })

    it('has zero votes and empty vote list', () => {
      const now = Math.floor(Date.now() / 1000)
      const proposal = buildOptimisticProposal({
        voteStart: now + 86400,
        voteEnd: now + 86400 + 259200,
      })

      expect(proposal.votes).toEqual([])
      expect(proposal.votingState.quorum).toBe(false)
      expect(proposal.votingState.for).toBe(0)
      expect(proposal.votingState.against).toBe(0)
      expect(proposal.votingState.abstain).toBe(0)
    })
  })
})
