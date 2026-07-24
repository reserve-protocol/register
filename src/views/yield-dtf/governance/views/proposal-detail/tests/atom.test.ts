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

// Both production seams (list: raw wei strings, detail: formatEther'd) delegate lifecycle + outcome to the SDK's bigint derivation.

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

// DETAIL-seam fixture: formatEther'd ether strings, block clock from blockAtom.
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

  it('TIE (for == against) → DEFEATED (OZ strict majority)', () => {
    expect(state({ for: '500', against: '500', abstain: '0', quorum: '100' })).toBe(
      PROPOSAL_STATES.DEFEATED
    )
  })

  it('for > against but for+abstain < quorum → QUORUM_NOT_REACHED', () => {
    expect(state({ for: '10', against: '5', abstain: '1', quorum: '1000' })).toBe(
      PROPOSAL_STATES.QUORUM_NOT_REACHED
    )
  })

  // Raw wei integer strings, AGAINST beats FOR by 1 wei — a Number cast would collapse both at 2^53.
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

  it('TIE → DEFEATED', () => {
    expect(
      readDetailState(ENDED_BLOCK, {
        for: '500',
        against: '500',
        abstain: '0',
        quorum: '100',
      })
    ).toBe(PROPOSAL_STATES.DEFEATED)
  })

  // formatEther'd strings differing by ONE wei — parseEther round-trips exactly, so the margin survives.
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

// The list seam (raw wei) and detail seam (formatted ether) derive the SAME outcome at a tie and at a >2^53-wei ±1 boundary.
describe('list vs detail agree (single source of truth)', () => {
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

// At the exact deadline the proposal is ACTIVE; after it a stale subgraph PENDING resolves to the vote outcome, never EXPIRED.
const WIN = { for: '1000', against: '500', abstain: '0', quorum: '100' }
const TIE = { for: '500', against: '500', abstain: '0', quorum: '100' }
const UNDER = { for: '10', against: '5', abstain: '1', quorum: '1000' }

describe('stale subgraph PENDING past the deadline — list seam (lifecycle)', () => {
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

describe('stale subgraph PENDING past the deadline — detail seam (lifecycle)', () => {
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

// The timelock operation id must build one zero value PER target and share one payload with proposalTxArgsAtom.
describe('timelockIdAtom multi-action operation id', () => {
  const targets = [
    '0x1111111111111111111111111111111111111111',
    '0x2222222222222222222222222222222222222222',
    '0x3333333333333333333333333333333333333333',
  ] as Address[]
  const calldatas = ['0xaaaa', '0xbbbb', '0xcccc'] as Hex[]
  const description = '# Multi-action proposal\nrotate two roles'
  const governor = '0x9999999999999999999999999999999999999999' as Address

  // Hand-computed OZ 4.x hashOperationBatch: salt = descriptionHash, predecessor = zeroHash, one zero value per target.
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

  it('differs from the old single-element [0n] preimage', () => {
    expect(readId()).not.toBe(handComputed([0n]))
  })

  // The queue/execute args must carry the SAME zero-values/targets/calldatas/description-hash as the id preimage.
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
