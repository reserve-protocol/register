import { describe, expect, it } from 'vitest'
import { createStore } from 'jotai'
import {
  encodeAbiParameters,
  formatEther,
  keccak256,
  parseAbiParameters,
  toBytes,
  zeroHash,
  type Address,
  type Hex,
} from 'viem'
import { PROPOSAL_STATES } from 'utils/constants'
import { blockAtom, rTokenGovernanceAtom } from 'state/atoms'
import {
  getProposalState,
  getProposalStateAtom,
  proposalDetailAtom,
  proposalTxArgsAtom,
  timelockIdAtom,
} from '../atom'

// The two PRODUCTION seams both delegate the proposal lifecycle + terminal
// outcome to the SDK's bigint derivation (OZ GovernorCountingSimple strict
// majority; tie → DEFEATED; exact wei precision), so they can never disagree:
//
//   - LIST/explorer  → getProposalState (raw subgraph WEI strings)
//   - DETAIL/badges  → getProposalStateAtom (formatEther'd ETHER strings)
//
// A non-"Governor Anastasius" framework selects the BLOCK-based path, so the
// block number deterministically controls the clock.

const ENDED_BLOCK = 1000 // > endBlock → voting window closed

// LIST-seam fixture: vote weights are raw subgraph wei strings.
const proposal = (
  votes: { for: string; against: string; abstain: string; quorum: string },
  state: string = PROPOSAL_STATES.ACTIVE
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => ({
  state,
  startBlock: 100,
  endBlock: 500,
  forWeightedVotes: votes.for,
  againstWeightedVotes: votes.against,
  abstainWeightedVotes: votes.abstain,
  quorumVotes: votes.quorum,
  governanceFramework: { name: 'Governor Alexios' }, // block-based
})

// DETAIL-seam: proposalDetailAtom holds formatEther'd (ether) strings and reads
// the block clock from blockAtom. Returns getProposalStateAtom's derived state.
const readDetailState = (
  block: number,
  votes: { for: string; against: string; abstain: string; quorum: string },
  state: string = PROPOSAL_STATES.ACTIVE
) => {
  const store = createStore()
  store.set(blockAtom, block)
  store.set(proposalDetailAtom, {
    state,
    version: 'Governor Alexios', // block-based (atom reads .version)
    startBlock: 100,
    endBlock: 500,
    forWeightedVotes: votes.for,
    againstWeightedVotes: votes.against,
    abstainWeightedVotes: votes.abstain,
    quorumVotes: votes.quorum,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)
  return store.get(getProposalStateAtom).state
}

describe('getProposalState (list seam) — terminal outcomes', () => {
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

  it('TIE (for == against) → DEFEATED (Z18: OZ strict majority)', () => {
    expect(state({ for: '500', against: '500', abstain: '0', quorum: '100' })).toBe(
      PROPOSAL_STATES.DEFEATED
    )
  })

  it('for > against but for+abstain < quorum → QUORUM_NOT_REACHED', () => {
    expect(state({ for: '10', against: '5', abstain: '1', quorum: '1000' })).toBe(
      PROPOSAL_STATES.QUORUM_NOT_REACHED
    )
  })

  // Faithful list fixture: raw wei integer strings, AGAINST beats FOR by 1 wei.
  // The old Number cast collapsed both to 2^53 and returned SUCCEEDED (Z18).
  it('respects a 1-wei margin in raw wei → DEFEATED', () => {
    expect(
      state({
        for: '9007199254740992', // 2^53
        against: '9007199254740993', // 2^53 + 1
        abstain: '0',
        quorum: '100',
      })
    ).toBe(PROPOSAL_STATES.DEFEATED)
  })
})

describe('getProposalStateAtom (detail seam) — terminal outcomes', () => {
  it('for > against, quorum met → SUCCEEDED', () => {
    expect(
      readDetailState(ENDED_BLOCK, {
        for: '1000',
        against: '500',
        abstain: '0',
        quorum: '100',
      })
    ).toBe(PROPOSAL_STATES.SUCCEEDED)
  })

  it('TIE → DEFEATED (Z18)', () => {
    expect(
      readDetailState(ENDED_BLOCK, {
        for: '500',
        against: '500',
        abstain: '0',
        quorum: '100',
      })
    ).toBe(PROPOSAL_STATES.DEFEATED)
  })

  // Faithful detail fixture: formatEther'd ether strings differing by ONE wei.
  // parseEther round-trips them exactly, so the bigint margin survives (the old
  // Number cast lost it → SUCCEEDED). Proves the detail-seam unit convention.
  it('respects a 1-wei margin in formatted ether → DEFEATED', () => {
    expect(
      readDetailState(ENDED_BLOCK, {
        for: formatEther(9007199254740992n),
        against: formatEther(9007199254740993n),
        abstain: '0',
        quorum: formatEther(100n),
      })
    ).toBe(PROPOSAL_STATES.DEFEATED)
  })
})

// One source of truth: the list seam (raw wei) and the detail seam (formatted
// ether) derive the SAME outcome for the equivalent proposal at a tie and at a
// >2^53-wei ±1 boundary.
describe('list vs detail agree (Z18 single source of truth)', () => {
  it('agree at a TIE (both DEFEATED)', () => {
    const list = getProposalState(
      proposal({ for: '5', against: '5', abstain: '0', quorum: '1' }),
      ENDED_BLOCK,
      1
    ).state
    const detail = readDetailState(ENDED_BLOCK, {
      for: formatEther(5n),
      against: formatEther(5n),
      abstain: '0',
      quorum: formatEther(1n),
    })
    expect(list).toBe(PROPOSAL_STATES.DEFEATED)
    expect(detail).toBe(list)
  })

  it('agree at a >2^53-wei 1-wei margin (both DEFEATED)', () => {
    const list = getProposalState(
      proposal({
        for: '9007199254740992',
        against: '9007199254740993',
        abstain: '0',
        quorum: '100',
      }),
      ENDED_BLOCK,
      1
    ).state
    const detail = readDetailState(ENDED_BLOCK, {
      for: formatEther(9007199254740992n),
      against: formatEther(9007199254740993n),
      abstain: '0',
      quorum: formatEther(100n),
    })
    expect(list).toBe(PROPOSAL_STATES.DEFEATED)
    expect(detail).toBe(list)
  })
})

// Z18 lifecycle. A subgraph PENDING proposal lags the on-chain time transitions.
// Pre-fix, register mapped a PENDING proposal at/after endBlock to EXPIRED (and
// the consumers disagreed at the exact-deadline equality). The SDK now owns the
// whole lifecycle: at the exact deadline it is ACTIVE, and after it the stale
// PENDING resolves to the vote outcome, never EXPIRED. Asserted through BOTH
// production seams.
const WIN = { for: '1000', against: '500', abstain: '0', quorum: '100' }
const TIE = { for: '500', against: '500', abstain: '0', quorum: '100' }
const UNDER = { for: '10', against: '5', abstain: '1', quorum: '1000' }

describe('stale subgraph PENDING past the deadline — list seam (Z18 lifecycle)', () => {
  const state = (block: number, v: typeof WIN) =>
    getProposalState(proposal(v, PROPOSAL_STATES.PENDING), block, 1).state

  it('exact deadline (block == endBlock) → ACTIVE (not EXPIRED)', () => {
    expect(state(500, WIN)).toBe(PROPOSAL_STATES.ACTIVE)
  })

  it('after deadline, quorum met + for wins → SUCCEEDED (not EXPIRED)', () => {
    expect(state(501, WIN)).toBe(PROPOSAL_STATES.SUCCEEDED)
  })

  it('after deadline, tie → DEFEATED (not EXPIRED)', () => {
    expect(state(501, TIE)).toBe(PROPOSAL_STATES.DEFEATED)
  })

  it('after deadline, under quorum → QUORUM_NOT_REACHED (not EXPIRED)', () => {
    expect(state(501, UNDER)).toBe(PROPOSAL_STATES.QUORUM_NOT_REACHED)
  })
})

describe('stale subgraph PENDING past the deadline — detail seam (Z18 lifecycle)', () => {
  const state = (block: number, v: typeof WIN) =>
    readDetailState(block, v, PROPOSAL_STATES.PENDING)

  it('exact deadline → ACTIVE (not EXPIRED)', () => {
    expect(state(500, WIN)).toBe(PROPOSAL_STATES.ACTIVE)
  })

  it('after deadline, for wins → SUCCEEDED (not EXPIRED)', () => {
    expect(state(501, WIN)).toBe(PROPOSAL_STATES.SUCCEEDED)
  })

  it('after deadline, tie → DEFEATED (not EXPIRED)', () => {
    expect(state(501, TIE)).toBe(PROPOSAL_STATES.DEFEATED)
  })
})

// Z17. The timelock operation id is keccak256 over (targets, values, calldatas,
// predecessor, salt). The old preimage hardcoded a single-element `[0n]` values
// array regardless of targets.length, so for any multi-action proposal the id
// did not match the on-chain operation and the guardian Cancel button stayed
// disabled. timelockIdAtom now delegates to the SDK's OZ 4.x batch hash, which
// builds one zero value PER target — and shares one payload with proposalTxArgsAtom.
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

  // Both consumers of the shared payload must agree: the queue/execute args must
  // carry the SAME N zero-values / targets / calldatas / description-hash as the
  // id preimage, so a regression on the write side can't slip past.
  it('proposalTxArgsAtom builds N zero-values from the same payload', () => {
    const store = createStore()
    store.set(rTokenGovernanceAtom, {
      governor,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    store.set(proposalDetailAtom, {
      governor,
      targets,
      calldatas,
      description,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const args = store.get(proposalTxArgsAtom)
    expect(args).toEqual([
      targets,
      [0n, 0n, 0n],
      calldatas,
      keccak256(toBytes(description)),
    ])
  })
})
