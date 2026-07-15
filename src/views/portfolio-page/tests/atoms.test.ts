import { describe, expect, it } from 'vitest'
import { PROPOSAL_STATES } from 'utils/constants'
import { getPortfolioProposalVotingState } from '../atoms'
import type { PortfolioProposal } from '../types'

// Independent-vector tests for the Portfolio active-proposals state derivation.
// Vectors follow the OpenZeppelin governor rule (quorum + for>against → SUCCEEDED;
// tie → DEFEATED). An ACTIVE proposal past voteEnd derives its terminal state.

const NOW = 1000 // >= voteEnd → voting ended

const prop = (v: {
  for: string
  against: string
  abstain: string
  quorum: string
}): PortfolioProposal =>
  ({
    state: PROPOSAL_STATES.ACTIVE,
    voteStart: '100',
    voteEnd: '500',
    forWeightedVotes: v.for,
    againstWeightedVotes: v.against,
    abstainWeightedVotes: v.abstain,
    quorumVotes: v.quorum,
    isOptimistic: false,
  }) as unknown as PortfolioProposal

const state = (v: Parameters<typeof prop>[0]) =>
  getPortfolioProposalVotingState(prop(v), NOW).state

describe('getPortfolioProposalVotingState — terminal outcomes', () => {
  it('for > against, quorum met → SUCCEEDED', () => {
    expect(state({ for: '1000', against: '500', abstain: '0', quorum: '100' })).toBe(
      PROPOSAL_STATES.SUCCEEDED
    )
  })
  it('against > for → DEFEATED', () => {
    expect(state({ for: '400', against: '600', abstain: '0', quorum: '100' })).toBe(
      PROPOSAL_STATES.DEFEATED
    )
  })
  it('zero for votes → DEFEATED', () => {
    expect(state({ for: '0', against: '0', abstain: '0', quorum: '100' })).toBe(
      PROPOSAL_STATES.DEFEATED
    )
  })
  it('for > against but under quorum → QUORUM_NOT_REACHED', () => {
    expect(state({ for: '10', against: '5', abstain: '1', quorum: '1000' })).toBe(
      PROPOSAL_STATES.QUORUM_NOT_REACHED
    )
  })
})

// Z22 FIXED (a second instance of Z18). The outcome is now decided in bigint
// with OZ strict majority, so a nonzero tie (for == against) is DEFEATED, not
// SUCCEEDED.
describe('getPortfolioProposalVotingState TIE (Z22 fixed)', () => {
  it('nonzero TIE → DEFEATED', () => {
    expect(state({ for: '500', against: '500', abstain: '0', quorum: '100' })).toBe(
      PROPOSAL_STATES.DEFEATED
    )
  })
})

// Z22 precision FIXED. AGAINST beats FOR by exactly 1 wei; the old Number cast
// collapsed both to 2^53 and returned SUCCEEDED, bigint keeps the margin →
// DEFEATED like the on-chain governor.
describe('getPortfolioProposalVotingState wei precision (Z22 fixed)', () => {
  it('bigint path respects the 1-wei margin → DEFEATED', () => {
    expect(
      state({
        for: '9007199254740992', // 2^53
        against: '9007199254740993', // 2^53 + 1 (one wei more)
        abstain: '0',
        quorum: '100',
      })
    ).toBe(PROPOSAL_STATES.DEFEATED)
  })
})
