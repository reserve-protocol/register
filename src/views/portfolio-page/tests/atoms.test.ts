import { describe, expect, it } from 'vitest'
import { createStore } from 'jotai'
import type { Address } from 'viem'
import { PROPOSAL_STATES } from 'utils/constants'
import {
  getPortfolioProposalVotingState,
  portfolioActiveProposalsAtom,
  portfolioDataAtom,
  portfolioNowAtom,
} from '../atoms'
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
  getPortfolioProposalVotingState(prop(v), NOW)?.state

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

// The outcome is decided in bigint with OZ strict majority — a nonzero tie is DEFEATED, not SUCCEEDED.
describe('getPortfolioProposalVotingState TIE', () => {
  it('nonzero TIE → DEFEATED', () => {
    expect(state({ for: '500', against: '500', abstain: '0', quorum: '100' })).toBe(
      PROPOSAL_STATES.DEFEATED
    )
  })
})

// AGAINST beats FOR by exactly 1 wei — bigint keeps the margin a Number cast would collapse at 2^53.
describe('getPortfolioProposalVotingState wei precision', () => {
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

// The SDK uses `> voteEnd` (ACTIVE at the exact deadline) — exercised through the real production seam.
const ADDR = '0x1111111111111111111111111111111111111111' as Address

const activeRows = (
  now: number,
  source: 'yield' | 'index',
  proposal: Record<string, unknown>
) => {
  const store = createStore()
  store.set(portfolioNowAtom, now)
  const position = {
    amount: '1',
    name: 'Test',
    symbol: 'TEST',
    address: ADDR,
    chainId: 1,
    activeProposals: [proposal],
  }
  store.set(portfolioDataAtom, {
    indexDTFs: [],
    yieldDTFs: [],
    rsrBalances: [],
    stakedRSR: source === 'yield' ? [position] : [],
    voteLocks:
      source === 'index'
        ? [{ ...position, dtfs: [{ name: 'Test', symbol: 'TEST', address: ADDR }] }]
        : [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)
  return store.get(portfolioActiveProposalsAtom)
}

const standardProposal = (voteEnd: number) => ({
  state: PROPOSAL_STATES.ACTIVE,
  voteStart: '100',
  voteEnd: String(voteEnd),
  forWeightedVotes: '1000',
  againstWeightedVotes: '500',
  abstainWeightedVotes: '0',
  quorumVotes: '100',
  creationTime: '1',
})

describe('portfolioActiveProposalsAtom — SDK oracle via production seam', () => {
  it('yield: at the exact deadline the proposal is ACTIVE, not terminal', () => {
    const rows = activeRows(500, 'yield', standardProposal(500))
    expect(rows).toHaveLength(1)
    expect(rows[0].voting.state).toBe(PROPOSAL_STATES.ACTIVE)
  })

  it('yield: after the deadline a for-winning quorum-met proposal is SUCCEEDED', () => {
    const rows = activeRows(501, 'yield', standardProposal(500))
    expect(rows).toHaveLength(1)
    expect(rows[0].voting.state).toBe(PROPOSAL_STATES.SUCCEEDED)
  })

  it('index: at the exact deadline the proposal is ACTIVE (Index oracle)', () => {
    const rows = activeRows(500, 'index', standardProposal(500))
    expect(rows).toHaveLength(1)
    expect(rows[0].voting.state).toBe(PROPOSAL_STATES.ACTIVE)
  })

  it('index optimistic: unopposed after the window resolves to SUCCEEDED', () => {
    const rows = activeRows(501, 'index', {
      ...standardProposal(500),
      isOptimistic: true,
      againstWeightedVotes: '0',
      vetoThreshold: '100000000000000000',
      vetoThresholdVotes: '1000',
      optimisticSnapshot: '1',
      optimisticSnapshotSupply: '10000',
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].voting.state).toBe(PROPOSAL_STATES.SUCCEEDED)
  })
})

// The reserve-api row carries the optimistic veto context; a transitioned proposal's MAX_UINT256 sentinel resolves to DEFEATED.
const MAX_UINT256 = ((1n << 256n) - 1n).toString()

const indexOptimistic = (against: string, extra: Record<string, unknown> = {}) => ({
  ...standardProposal(500),
  isIndexDTF: true,
  isOptimistic: true,
  vetoThreshold: '100000000000000000',
  vetoThresholdVotes: '1000',
  optimisticSnapshot: '1',
  optimisticSnapshotSupply: '10000',
  againstWeightedVotes: against,
  ...extra,
})

const optimisticState = (against: string, now = 501) =>
  getPortfolioProposalVotingState(
    indexOptimistic(against) as unknown as PortfolioProposal,
    now
  )?.state

describe('getPortfolioProposalVotingState — optimistic Index veto', () => {
  it('opposed below the veto threshold → SUCCEEDED', () => {
    expect(optimisticState('999')).toBe(PROPOSAL_STATES.SUCCEEDED)
  })
  it('opposed at/above the veto threshold → DEFEATED', () => {
    expect(optimisticState('1000')).toBe(PROPOSAL_STATES.DEFEATED)
  })
  it('below the veto threshold before the deadline stays ACTIVE', () => {
    expect(optimisticState('500', 499)).toBe(PROPOSAL_STATES.ACTIVE)
  })
  it('transitioned proposal (vetoThreshold = MAX_UINT256) → DEFEATED', () => {
    const transitioned = {
      ...standardProposal(500),
      isIndexDTF: true,
      isOptimistic: true,
      vetoThreshold: MAX_UINT256,
    } as unknown as PortfolioProposal
    expect(getPortfolioProposalVotingState(transitioned, 501)?.state).toBe(
      PROPOSAL_STATES.DEFEATED
    )
  })
  it('transitioned proposal is DEFEATED immediately, inside the voting window', () => {
    const transitioned = {
      ...standardProposal(500),
      isIndexDTF: true,
      isOptimistic: true,
      vetoThreshold: MAX_UINT256,
    } as unknown as PortfolioProposal
    // The sentinel resolves mid-window — it does not wait for the deadline.
    expect(getPortfolioProposalVotingState(transitioned, 300)?.state).toBe(
      PROPOSAL_STATES.DEFEATED
    )
  })
})

describe('portfolioActiveProposalsAtom — optimistic list membership', () => {
  it('opposed below the veto threshold stays in the active list (SUCCEEDED)', () => {
    const rows = activeRows(501, 'index', indexOptimistic('999'))
    expect(rows).toHaveLength(1)
    expect(rows[0].voting.state).toBe(PROPOSAL_STATES.SUCCEEDED)
  })

  it('vetoed proposal leaves the active list (DEFEATED is terminal)', () => {
    const rows = activeRows(501, 'index', indexOptimistic('1000'))
    expect(rows).toHaveLength(0)
  })

  it('transitioned proposal leaves the active list (DEFEATED via the sentinel)', () => {
    const rows = activeRows(501, 'index', {
      ...standardProposal(500),
      isOptimistic: true,
      vetoThreshold: MAX_UINT256,
    })
    expect(rows).toHaveLength(0)
  })

  it('transitioned proposal leaves the active list even inside the window', () => {
    const rows = activeRows(300, 'index', {
      ...standardProposal(500),
      isOptimistic: true,
      vetoThreshold: MAX_UINT256,
    })
    expect(rows).toHaveLength(0)
  })
})

// A malformed wei field marks the row null (dropped) — never a synchronous
// throw that blanks the Portfolio route, and never a fabricated outcome.
describe('malformed proposal rows', () => {
  it.each([
    ['empty string', ''],
    ['decimal string', '1.5'],
    ['non-numeric', 'abc'],
    ['missing', undefined],
  ])('forWeightedVotes %s → null, no throw', (_label, bad) => {
    const row = {
      ...standardProposal(500),
      forWeightedVotes: bad,
    } as unknown as PortfolioProposal
    expect(() => getPortfolioProposalVotingState(row, 501)).not.toThrow()
    expect(getPortfolioProposalVotingState(row, 501)).toBeNull()
  })

  it('a malformed row is dropped from the active list while a healthy sibling survives', () => {
    const rows = activeRows(501, 'yield', standardProposal(500))
    expect(rows).toHaveLength(1)

    const store = createStore()
    store.set(portfolioNowAtom, 501)
    store.set(portfolioDataAtom, {
      indexDTFs: [],
      yieldDTFs: [],
      rsrBalances: [],
      voteLocks: [],
      stakedRSR: [
        {
          amount: '1',
          name: 'Test',
          symbol: 'TEST',
          address: ADDR,
          chainId: 1,
          activeProposals: [
            standardProposal(500),
            { ...standardProposal(500), id: 'bad', forWeightedVotes: '' },
          ],
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const survivors = store.get(portfolioActiveProposalsAtom)
    expect(survivors).toHaveLength(1)
    expect(survivors[0].id).not.toBe('bad')
  })

  // An optimistic call without a valid context makes the oracle report an
  // expired opposed proposal ACTIVE forever — so any invalid veto/snapshot
  // field drops the whole row, it never degrades to context-less optimistic.
  it.each([
    ['vetoThreshold', { vetoThreshold: 'garbage' }],
    ['vetoThresholdVotes', { vetoThresholdVotes: '1.23' }],
    ['optimisticSnapshot', { optimisticSnapshot: 'x' }],
    ['optimisticSnapshotSupply', { optimisticSnapshotSupply: '' }],
    ['missing optimisticSnapshot', { optimisticSnapshot: undefined }],
  ])('optimistic row with invalid %s → null', (_label, bad) => {
    const row = {
      ...indexOptimistic('10'),
      ...bad,
    } as unknown as PortfolioProposal
    expect(() => getPortfolioProposalVotingState(row, 501)).not.toThrow()
    expect(getPortfolioProposalVotingState(row, 501)).toBeNull()
  })

  it('transitioned row (MAX_UINT256 sentinel) resolves DEFEATED even with garbage context fields', () => {
    const row = {
      ...indexOptimistic('10', {
        vetoThreshold: MAX_UINT256,
        optimisticSnapshot: 'x',
        optimisticSnapshotSupply: '',
        vetoThresholdVotes: 'garbage',
      }),
    } as unknown as PortfolioProposal
    expect(getPortfolioProposalVotingState(row, 300)?.state).toBe(
      PROPOSAL_STATES.DEFEATED
    )
  })

  it('a malformed optimistic row is dropped from the active list while a healthy optimistic sibling survives', () => {
    const store = createStore()
    store.set(portfolioNowAtom, 300)
    store.set(portfolioDataAtom, {
      indexDTFs: [],
      yieldDTFs: [],
      rsrBalances: [],
      stakedRSR: [],
      voteLocks: [
        {
          amount: '1',
          name: 'Test',
          symbol: 'TEST',
          address: ADDR,
          chainId: 1,
          dtfs: [{ name: 'Test', symbol: 'TEST', address: ADDR }],
          activeProposals: [
            { ...indexOptimistic('10'), id: 'healthy' },
            { ...indexOptimistic('10'), id: 'bad', optimisticSnapshot: 'NaN' },
          ],
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    const survivors = store.get(portfolioActiveProposalsAtom)
    expect(survivors).toHaveLength(1)
    expect(survivors[0].id).toBe('healthy')
  })

  it.each([
    ['voteEnd', { voteEnd: 'soon' }],
    ['voteStart', { voteStart: undefined }],
    ['executionETA', { state: PROPOSAL_STATES.QUEUED, executionETA: 'later' }],
  ])('non-finite %s timestamp → null', (_label, bad) => {
    const row = {
      ...standardProposal(500),
      ...bad,
    } as unknown as PortfolioProposal
    expect(getPortfolioProposalVotingState(row, 501)).toBeNull()
  })
})
