import { describe, it, expect } from 'vitest'
import { getProposalState, PartialProposal } from '../governance'
import { PROPOSAL_STATES } from '@/utils/constants'

const makeProposal = (
  overrides: Partial<PartialProposal> = {}
): PartialProposal => ({
  id: '1',
  timelockId: '0x1',
  description: 'Test proposal',
  creationTime: 1000,
  creationBlock: 1,
  state: PROPOSAL_STATES.PENDING,
  forWeightedVotes: 0,
  abstainWeightedVotes: 0,
  againstWeightedVotes: 0,
  quorumVotes: 100,
  voteStart: 2000,
  voteEnd: 3000,
  proposer: { address: '0x1' as `0x${string}` },
  ...overrides,
})

describe('getProposalState', () => {
  describe('PENDING proposals', () => {
    it('stays PENDING before voteStart', () => {
      const proposal = makeProposal({ state: PROPOSAL_STATES.PENDING })
      const result = getProposalState(proposal, 1500)

      expect(result.state).toBe(PROPOSAL_STATES.PENDING)
      expect(result.deadline).toBe(500) // 2000 - 1500
    })

    it('becomes ACTIVE during voting period', () => {
      const proposal = makeProposal({ state: PROPOSAL_STATES.PENDING })
      const result = getProposalState(proposal, 2500)

      expect(result.state).toBe(PROPOSAL_STATES.ACTIVE)
      expect(result.deadline).toBe(500) // 3000 - 2500
    })

    it('becomes EXPIRED after voting ends', () => {
      const proposal = makeProposal({ state: PROPOSAL_STATES.PENDING })
      const result = getProposalState(proposal, 3500)

      expect(result.state).toBe(PROPOSAL_STATES.EXPIRED)
    })
  })

  describe('ACTIVE proposals', () => {
    it('stays ACTIVE during voting with deadline', () => {
      const proposal = makeProposal({ state: PROPOSAL_STATES.ACTIVE })
      const result = getProposalState(proposal, 2800)

      expect(result.state).toBe(PROPOSAL_STATES.ACTIVE)
      expect(result.deadline).toBe(200) // 3000 - 2800
    })

    it('SUCCEEDED when for > against and quorum met', () => {
      const proposal = makeProposal({
        state: PROPOSAL_STATES.ACTIVE,
        forWeightedVotes: 200,
        againstWeightedVotes: 50,
        abstainWeightedVotes: 0,
        quorumVotes: 100,
      })
      const result = getProposalState(proposal, 3500)

      expect(result.state).toBe(PROPOSAL_STATES.SUCCEEDED)
    })

    it('DEFEATED when against > for', () => {
      const proposal = makeProposal({
        state: PROPOSAL_STATES.ACTIVE,
        forWeightedVotes: 50,
        againstWeightedVotes: 200,
        abstainWeightedVotes: 0,
        quorumVotes: 100,
      })
      const result = getProposalState(proposal, 3500)

      expect(result.state).toBe(PROPOSAL_STATES.DEFEATED)
    })

    it('DEFEATED when no votes cast', () => {
      const proposal = makeProposal({
        state: PROPOSAL_STATES.ACTIVE,
        forWeightedVotes: 0,
        againstWeightedVotes: 0,
        abstainWeightedVotes: 0,
      })
      const result = getProposalState(proposal, 3500)

      expect(result.state).toBe(PROPOSAL_STATES.DEFEATED)
    })

    it('QUORUM_NOT_REACHED when for+abstain < quorum', () => {
      const proposal = makeProposal({
        state: PROPOSAL_STATES.ACTIVE,
        forWeightedVotes: 30,
        againstWeightedVotes: 10,
        abstainWeightedVotes: 20,
        quorumVotes: 100,
      })
      const result = getProposalState(proposal, 3500)

      expect(result.state).toBe(PROPOSAL_STATES.QUORUM_NOT_REACHED)
    })
  })

  describe('QUEUED proposals', () => {
    it('sets deadline from executionETA', () => {
      const proposal = makeProposal({
        state: PROPOSAL_STATES.QUEUED,
        executionETA: 5000,
      })
      const result = getProposalState(proposal, 4000)

      expect(result.state).toBe(PROPOSAL_STATES.QUEUED)
      expect(result.deadline).toBe(1000) // 5000 - 4000
    })
  })

  describe('finalized proposals pass through unchanged', () => {
    const finalStates = [
      PROPOSAL_STATES.EXECUTED,
      PROPOSAL_STATES.CANCELED,
      PROPOSAL_STATES.EXPIRED,
    ]

    for (const finalState of finalStates) {
      it(`${finalState} passes through`, () => {
        const proposal = makeProposal({ state: finalState })
        const result = getProposalState(proposal, 9999)

        expect(result.state).toBe(finalState)
      })
    }
  })

  describe('vote percentages', () => {
    it('computes correct percentages', () => {
      const proposal = makeProposal({
        state: PROPOSAL_STATES.ACTIVE,
        forWeightedVotes: 60,
        againstWeightedVotes: 30,
        abstainWeightedVotes: 10,
      })
      const result = getProposalState(proposal, 2500)

      expect(result.for).toBe(60)
      expect(result.against).toBe(30)
      expect(result.abstain).toBe(10)
    })

    it('returns 0 percentages when no votes', () => {
      const proposal = makeProposal({ state: PROPOSAL_STATES.ACTIVE })
      const result = getProposalState(proposal, 2500)

      expect(result.for).toBe(0)
      expect(result.against).toBe(0)
      expect(result.abstain).toBe(0)
    })
  })

  describe('quorum flag', () => {
    it('quorum true when forVotes >= quorumVotes', () => {
      const proposal = makeProposal({
        state: PROPOSAL_STATES.ACTIVE,
        forWeightedVotes: 150,
        quorumVotes: 100,
      })
      const result = getProposalState(proposal, 2500)

      expect(result.quorum).toBe(true)
    })

    it('quorum false when forVotes < quorumVotes', () => {
      const proposal = makeProposal({
        state: PROPOSAL_STATES.ACTIVE,
        forWeightedVotes: 50,
        quorumVotes: 100,
      })
      const result = getProposalState(proposal, 2500)

      expect(result.quorum).toBe(false)
    })
  })

  describe('short vote period bug fix', () => {
    it('SUCCEEDED with optimistic vote that tips the balance', () => {
      // User votes FOR with enough power to pass, voting has ended
      const proposal = makeProposal({
        state: PROPOSAL_STATES.ACTIVE,
        forWeightedVotes: 150, // after optimistic vote
        againstWeightedVotes: 100,
        abstainWeightedVotes: 0,
        quorumVotes: 100,
      })
      const result = getProposalState(proposal, 3500) // after voteEnd

      expect(result.state).toBe(PROPOSAL_STATES.SUCCEEDED)
    })
  })
})
