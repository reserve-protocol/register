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

// BUG Z22 (docs/plans/REGISTER_HARDENING.md) — a second instance of Z18. Uses JS `Number`
// on wei vote weights (precision loss > 2^53) and treats a tie (for == against,
// both > 0) as SUCCEEDED (`againstVotes > forVotes || forVotes === 0` is false on
// a nonzero tie → falls through to SUCCEEDED), contradicting the on-chain
// governor. `it.fails` documents it and flips when the app is fixed.
describe('getPortfolioProposalVotingState TIE — KNOWN BUG (Z22)', () => {
  it.fails('nonzero TIE should be DEFEATED but is currently SUCCEEDED', () => {
    expect(state({ for: '500', against: '500', abstain: '0', quorum: '100' })).toBe(
      PROPOSAL_STATES.DEFEATED
    )
  })
})

// BUG Z22 (precision dimension). Same Number() cast, same failure above 2^53:
// AGAINST beats FOR by 1 wei, but Number('9007199254740993') ===
// Number('9007199254740992'), so the derivation sees a tie and returns SUCCEEDED
// where the on-chain governor is DEFEATED. Flips green when the app uses BigInt.
describe('getPortfolioProposalVotingState wei precision — KNOWN BUG (Z22 precision)', () => {
  it.fails('Number path loses the 1-wei margin: should be DEFEATED, is SUCCEEDED', () => {
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
