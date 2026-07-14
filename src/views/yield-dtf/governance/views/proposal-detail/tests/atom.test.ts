import { describe, expect, it } from 'vitest'
import { PROPOSAL_STATES } from 'utils/constants'
import { getProposalState, getProposalStatus } from '../atom'

// Independent-vector unit tests for the two pure proposal-state derivations.
// These are the "does the number mean the right thing" tests the e2e suite
// cannot prove offline. Vectors are hand-derived from the OpenZeppelin governor
// rule: after voting ends, a proposal SUCCEEDS iff quorum is met AND for>against;
// a tie (for==against) is DEFEATED.
//
// A non-"Governor Anastasius" framework name selects the BLOCK-based path, so
// `blockNumber` deterministically controls the clock (no getCurrentTime coupling
// on the terminal-state branch).

const ENDED_BLOCK = 1000 // > endBlock → voting window closed

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proposal = (votes: {
  for: string
  against: string
  abstain: string
  quorum: string
}): any => ({
  state: PROPOSAL_STATES.ACTIVE,
  startBlock: 100,
  endBlock: 500,
  forWeightedVotes: votes.for,
  againstWeightedVotes: votes.against,
  abstainWeightedVotes: votes.abstain,
  quorumVotes: votes.quorum,
  governanceFramework: { name: 'Governor Alexios' }, // block-based
})

describe('getProposalStatus (bigint) — matches the on-chain governor', () => {
  const status = (v: Parameters<typeof proposal>[0]) =>
    getProposalStatus(proposal(v), ENDED_BLOCK)

  it('for > against, quorum met → SUCCEEDED', () => {
    expect(status({ for: '1000', against: '500', abstain: '0', quorum: '100' })).toBe(
      PROPOSAL_STATES.SUCCEEDED
    )
  })

  it('against > for → DEFEATED', () => {
    expect(status({ for: '400', against: '600', abstain: '0', quorum: '100' })).toBe(
      PROPOSAL_STATES.DEFEATED
    )
  })

  it('TIE (for == against) → DEFEATED (on-chain rule)', () => {
    expect(status({ for: '500', against: '500', abstain: '0', quorum: '100' })).toBe(
      PROPOSAL_STATES.DEFEATED
    )
  })

  it('for > against but for+abstain < quorum → QUORUM_NOT_REACHED', () => {
    expect(status({ for: '10', against: '5', abstain: '1', quorum: '1000' })).toBe(
      PROPOSAL_STATES.QUORUM_NOT_REACHED
    )
  })
})

describe('getProposalState (Number) — agrees on unambiguous outcomes', () => {
  const state = (v: Parameters<typeof proposal>[0]) =>
    getProposalState(proposal(v), ENDED_BLOCK, 1).state

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

  it('for > against but under quorum → QUORUM_NOT_REACHED', () => {
    expect(state({ for: '10', against: '5', abstain: '1', quorum: '1000' })).toBe(
      PROPOSAL_STATES.QUORUM_NOT_REACHED
    )
  })
})

// BUG Z18 (REGISTER_HARDENING.md, engineer review). getProposalState uses `+`
// (JS Number) vote weights and treats a TIE as SUCCEEDED (`againstVotes > forVotes`
// is false on a tie → falls through to SUCCEEDED), contradicting getProposalStatus
// and the on-chain governor (tie → DEFEATED). `it.fails` documents the current
// wrong behavior and will FLIP (start failing) the moment the app is fixed —
// prompting removal of this marker.
describe('getProposalState TIE handling — KNOWN BUG (Z18)', () => {
  it.fails('TIE should be DEFEATED but is currently SUCCEEDED', () => {
    const s = getProposalState(
      proposal({ for: '500', against: '500', abstain: '0', quorum: '100' }),
      ENDED_BLOCK,
      1
    ).state
    // Desired (matches getProposalStatus + on-chain). Fails today.
    expect(s).toBe(PROPOSAL_STATES.DEFEATED)
  })
})

// BUG Z18 (precision dimension). Vote weights are wei — above 2^53 the `Number`
// cast is lossy. Here AGAINST beats FOR by exactly 1 wei, but both are 2^53±:
// Number('9007199254740993') === Number('9007199254740992'), so the Number path
// sees an (already-mishandled) tie and returns SUCCEEDED, while the on-chain
// governor (against > for) is DEFEATED. The bigint getProposalStatus is correct;
// this pins that getProposalState is NOT. Flips green when the app uses BigInt.
describe('getProposalState wei precision — KNOWN BUG (Z18 precision)', () => {
  const FOR = '9007199254740992' // 2^53
  const AGAINST = '9007199254740993' // 2^53 + 1 (one wei more)

  it('bigint path already respects the 1-wei margin → DEFEATED', () => {
    expect(
      getProposalStatus(
        proposal({ for: FOR, against: AGAINST, abstain: '0', quorum: '100' }),
        ENDED_BLOCK
      )
    ).toBe(PROPOSAL_STATES.DEFEATED)
  })

  it.fails('Number path loses the 1-wei margin: should be DEFEATED, is SUCCEEDED', () => {
    const s = getProposalState(
      proposal({ for: FOR, against: AGAINST, abstain: '0', quorum: '100' }),
      ENDED_BLOCK,
      1
    ).state
    expect(s).toBe(PROPOSAL_STATES.DEFEATED)
  })
})
