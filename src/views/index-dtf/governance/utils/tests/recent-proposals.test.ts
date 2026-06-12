import { PROPOSAL_STATES } from '@/utils/constants'
import type { IndexDtfProposalDetail } from '@reserve-protocol/react-sdk'
import { describe, expect, it } from 'vitest'
import {
  getRecentProposalKey,
  getRecentProposalsForDtf,
  getUpdatedRecentProposalDetail,
  mergeRecentProposals,
  type RecentProposalData,
  type RecentProposalsMap,
} from '../recent-proposals'

const DTF = '0xAbCd000000000000000000000000000000000001'
const CHAIN_ID = 8453

const now = () => Math.floor(Date.now() / 1000)

const makeDetail = (
  overrides: Partial<IndexDtfProposalDetail> = {}
): IndexDtfProposalDetail =>
  ({
    id: '1',
    chainId: CHAIN_ID,
    creationTime: now(),
    voteStart: now() - 100,
    voteEnd: now() + 1000,
    state: PROPOSAL_STATES.ACTIVE,
    ...overrides,
  }) as IndexDtfProposalDetail

const makeRecent = (
  overrides: Partial<IndexDtfProposalDetail> = {}
): RecentProposalData => ({
  detail: makeDetail(overrides),
  event: {} as RecentProposalData['event'],
  addedAt: now(),
})

const recentMap = (
  ...entries: [string, RecentProposalData][]
): RecentProposalsMap => Object.fromEntries(entries)

describe('getRecentProposalKey', () => {
  it('lowercases the dtf address so lookups are case-insensitive', () => {
    const key = getRecentProposalKey({
      chainId: CHAIN_ID,
      dtf: DTF,
      proposalId: '42',
    })

    expect(key).toBe(`${CHAIN_ID}:${DTF.toLowerCase()}:42`)
  })
})

describe('mergeRecentProposals', () => {
  it('returns undefined when there is no data from either source', () => {
    const result = mergeRecentProposals({
      subgraphProposals: undefined,
      proposalCount: undefined,
      recentProposals: {},
      chainId: CHAIN_ID,
      dtf: DTF,
    })

    expect(result.proposals).toBeUndefined()
    expect(result.proposalCount).toBeUndefined()
  })

  it('prepends recent proposals not yet indexed and bumps the count', () => {
    const subgraph = [makeDetail({ id: '1' })]
    const recent = recentMap([
      getRecentProposalKey({ chainId: CHAIN_ID, dtf: DTF, proposalId: '2' }),
      makeRecent({ id: '2' }),
    ])

    const result = mergeRecentProposals({
      subgraphProposals: subgraph,
      proposalCount: 1,
      recentProposals: recent,
      chainId: CHAIN_ID,
      dtf: DTF,
    })

    expect(result.proposals?.map((p) => p.id)).toEqual(['2', '1'])
    expect(result.proposalCount).toBe(2)
  })

  it('drops recent proposals already indexed by the subgraph', () => {
    const subgraph = [makeDetail({ id: '1' })]
    const recent = recentMap([
      getRecentProposalKey({ chainId: CHAIN_ID, dtf: DTF, proposalId: '1' }),
      makeRecent({ id: '1' }),
    ])

    const result = mergeRecentProposals({
      subgraphProposals: subgraph,
      proposalCount: 1,
      recentProposals: recent,
      chainId: CHAIN_ID,
      dtf: DTF,
    })

    expect(result.proposals?.map((p) => p.id)).toEqual(['1'])
    expect(result.proposalCount).toBe(1)
  })

  it('returns recent proposals alone while the subgraph has nothing', () => {
    const recent = recentMap([
      getRecentProposalKey({ chainId: CHAIN_ID, dtf: DTF, proposalId: '7' }),
      makeRecent({ id: '7' }),
    ])

    const result = mergeRecentProposals({
      subgraphProposals: undefined,
      proposalCount: undefined,
      recentProposals: recent,
      chainId: CHAIN_ID,
      dtf: DTF,
    })

    expect(result.proposals?.map((p) => p.id)).toEqual(['7'])
    expect(result.proposalCount).toBe(1)
  })

  it('sorts unindexed recent proposals newest first', () => {
    const recent = recentMap(
      [
        getRecentProposalKey({ chainId: CHAIN_ID, dtf: DTF, proposalId: '1' }),
        makeRecent({ id: '1', creationTime: now() - 200 }),
      ],
      [
        getRecentProposalKey({ chainId: CHAIN_ID, dtf: DTF, proposalId: '2' }),
        makeRecent({ id: '2', creationTime: now() - 100 }),
      ]
    )

    const result = mergeRecentProposals({
      subgraphProposals: [],
      proposalCount: 0,
      recentProposals: recent,
      chainId: CHAIN_ID,
      dtf: DTF,
    })

    expect(result.proposals?.map((p) => p.id)).toEqual(['2', '1'])
  })
})

describe('getRecentProposalsForDtf', () => {
  it('matches the dtf address case-insensitively and scopes by chain', () => {
    const recent = recentMap(
      [
        getRecentProposalKey({ chainId: CHAIN_ID, dtf: DTF, proposalId: '1' }),
        makeRecent({ id: '1' }),
      ],
      [
        getRecentProposalKey({ chainId: 1, dtf: DTF, proposalId: '2' }),
        makeRecent({ id: '2' }),
      ],
      [
        getRecentProposalKey({
          chainId: CHAIN_ID,
          dtf: '0xother0000000000000000000000000000000002',
          proposalId: '3',
        }),
        makeRecent({ id: '3' }),
      ]
    )

    const result = getRecentProposalsForDtf(
      recent,
      CHAIN_ID,
      DTF.toUpperCase().replace('0X', '0x')
    )

    expect(result.map((p) => p.detail.id)).toEqual(['1'])
  })

  it('returns nothing without a dtf address', () => {
    expect(getRecentProposalsForDtf({}, CHAIN_ID, undefined)).toEqual([])
  })
})

describe('getUpdatedRecentProposalDetail', () => {
  it('marks proposals pending before voteStart with a countdown to start', () => {
    const detail = makeDetail({
      voteStart: now() + 500,
      voteEnd: now() + 1000,
      state: PROPOSAL_STATES.PENDING,
    })

    const updated = getUpdatedRecentProposalDetail(detail)

    expect(updated.state).toBe(PROPOSAL_STATES.PENDING)
    expect(updated.votingState.state).toBe(PROPOSAL_STATES.PENDING)
    expect(updated.votingState.deadline).toBeGreaterThan(0)
    expect(updated.votingState.deadline).toBeLessThanOrEqual(500)
  })

  it('marks proposals active after voteStart with a countdown to end', () => {
    const detail = makeDetail({
      voteStart: now() - 100,
      voteEnd: now() + 1000,
      state: PROPOSAL_STATES.PENDING,
    })

    const updated = getUpdatedRecentProposalDetail(detail)

    expect(updated.state).toBe(PROPOSAL_STATES.ACTIVE)
    expect(updated.votingState.deadline).toBeGreaterThan(0)
    expect(updated.votingState.deadline).toBeLessThanOrEqual(1000)
  })

  it('clamps the deadline at zero once the vote window has passed', () => {
    const detail = makeDetail({
      voteStart: now() - 1000,
      voteEnd: now() - 100,
    })

    const updated = getUpdatedRecentProposalDetail(detail)

    expect(updated.state).toBe(PROPOSAL_STATES.ACTIVE)
    expect(updated.votingState.deadline).toBe(0)
  })
})
