import { describe, expect, it } from 'vitest'
import { createStore } from 'jotai'
import {
  encodeAbiParameters,
  keccak256,
  parseAbiParameters,
  toBytes,
  zeroHash,
  type Address,
  type Hex,
} from 'viem'
import { PROPOSAL_STATES } from 'utils/constants'
import {
  getProposalState,
  getProposalStatus,
  proposalDetailAtom,
  timelockIdAtom,
} from '../atom'

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

// Z18 FIXED. getProposalState now delegates the terminal outcome to the SDK's
// bigint derivation, so a TIE is DEFEATED (OZ strict majority), matching
// getProposalStatus and the on-chain governor.
describe('getProposalState TIE handling (Z18 fixed)', () => {
  it('TIE → DEFEATED', () => {
    const s = getProposalState(
      proposal({ for: '500', against: '500', abstain: '0', quorum: '100' }),
      ENDED_BLOCK,
      1
    ).state
    expect(s).toBe(PROPOSAL_STATES.DEFEATED)
  })
})

// Z18 precision FIXED. Vote weights above 2^53 are exact under bigint. AGAINST
// beats FOR by 1 wei; the old Number cast collapsed both to 2^53 and returned
// SUCCEEDED, the bigint path returns DEFEATED (against > for) like the governor.
describe('getProposalState wei precision (Z18 fixed)', () => {
  const FOR = '9007199254740992' // 2^53
  const AGAINST = '9007199254740993' // 2^53 + 1 (one wei more)

  it('bigint path respects the 1-wei margin → DEFEATED', () => {
    expect(
      getProposalStatus(
        proposal({ for: FOR, against: AGAINST, abstain: '0', quorum: '100' }),
        ENDED_BLOCK
      )
    ).toBe(PROPOSAL_STATES.DEFEATED)
  })

  it('getProposalState respects the 1-wei margin → DEFEATED', () => {
    const s = getProposalState(
      proposal({ for: FOR, against: AGAINST, abstain: '0', quorum: '100' }),
      ENDED_BLOCK,
      1
    ).state
    expect(s).toBe(PROPOSAL_STATES.DEFEATED)
  })
})

// One source of truth: the badge (getProposalState) and the list (getProposalStatus)
// derive the terminal outcome from the same SDK function, so they can never
// disagree at a tie or a >2^53-wei ±1 boundary.
describe('list vs detail agree (Z18 single source of truth)', () => {
  const agree = (v: Parameters<typeof proposal>[0]) => {
    const p = proposal(v)
    expect(getProposalState(p, ENDED_BLOCK, 1).state).toBe(
      getProposalStatus(p, ENDED_BLOCK)
    )
  }

  it('agree at a TIE (both DEFEATED)', () => {
    agree({ for: '500', against: '500', abstain: '0', quorum: '100' })
  })

  it('agree at a >2^53-wei 1-wei margin (both DEFEATED)', () => {
    agree({
      for: '9007199254740992',
      against: '9007199254740993',
      abstain: '0',
      quorum: '100',
    })
  })

  it('agree on a clear pass (both SUCCEEDED)', () => {
    agree({ for: '1000', against: '500', abstain: '0', quorum: '100' })
  })
})

// Z17. The timelock operation id is keccak256 over (targets, values, calldatas,
// predecessor, salt). The old preimage hardcoded a single-element `[0n]` values
// array regardless of targets.length, so for any multi-action proposal the id
// did not match the on-chain operation and the guardian Cancel button stayed
// disabled. timelockIdAtom now delegates to the SDK's OZ 4.x batch hash, which
// builds one zero value PER target.
describe('timelockIdAtom multi-action operation id (Z17)', () => {
  const targets = [
    '0x1111111111111111111111111111111111111111',
    '0x2222222222222222222222222222222222222222',
    '0x3333333333333333333333333333333333333333',
  ] as Address[]
  const calldatas = ['0xaaaa', '0xbbbb', '0xcccc'] as Hex[]
  const description = '# Multi-action proposal\nrotate two roles'
  const governor = '0x9999999999999999999999999999999999999999' as Address

  // Hand-computed OZ 4.x hashOperationBatch: salt = descriptionHash, predecessor
  // = zeroHash, one zero value per target.
  const handComputed = (values: bigint[]) =>
    keccak256(
      encodeAbiParameters(
        parseAbiParameters('address[], uint256[], bytes[], bytes32, bytes32'),
        [targets, values, calldatas, zeroHash, keccak256(toBytes(description))]
      )
    )

  const readId = () => {
    const store = createStore()
    store.set(proposalDetailAtom, {
      governor,
      targets,
      calldatas,
      description,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    return store.get(timelockIdAtom)
  }

  it('matches hashOperationBatch with a zero value PER target (N=3)', () => {
    expect(readId()).toBe(handComputed([0n, 0n, 0n]))
  })

  it('differs from the old single-element [0n] preimage (the Z17 bug)', () => {
    expect(readId()).not.toBe(handComputed([0n]))
  })
})
