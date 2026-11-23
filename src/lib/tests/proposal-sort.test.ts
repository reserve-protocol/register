import { describe, expect, it } from 'vitest'
import { PROPOSAL_STATES } from '@/utils/constants'
import { sortProposals } from '../proposal-sort'

const row = (id: string, state: string, creationTime: number) => ({
  id,
  state,
  creationTime: String(creationTime),
})

const rows = [
  row('pending-new', PROPOSAL_STATES.PENDING, 500),
  row('executed', PROPOSAL_STATES.EXECUTED, 400),
  row('active-old', PROPOSAL_STATES.ACTIVE, 100),
  row('queued', PROPOSAL_STATES.QUEUED, 300),
  row('active-new', PROPOSAL_STATES.ACTIVE, 200),
  row('succeeded', PROPOSAL_STATES.SUCCEEDED, 50),
  row('defeated', PROPOSAL_STATES.DEFEATED, 600),
  row('unknown', 'SOMETHING_ELSE', 700),
]
const ids = (sorted: typeof rows) => sorted.map((r) => r.id)
const getState = (r: (typeof rows)[number]) => r.state

describe('sortProposals', () => {
  it('puts actionable states first, newest first within each state', () => {
    expect(ids(sortProposals(rows, 'status', getState))).toEqual([
      'active-new',
      'active-old',
      'pending-new',
      'succeeded',
      'queued',
      'executed',
      'defeated',
      'unknown',
    ])
  })

  it('keeps active proposals ahead of a larger number of newer pending ones', () => {
    const many = [
      ...Array.from({ length: 10 }, (_, i) =>
        row(`pending-${i}`, PROPOSAL_STATES.PENDING, 1000 + i)
      ),
      row('active', PROPOSAL_STATES.ACTIVE, 1),
    ]
    expect(sortProposals(many, 'status', getState)[0].id).toBe('active')
  })

  it('sorts by creation time when newest is selected', () => {
    expect(ids(sortProposals(rows, 'newest', getState))).toEqual([
      'unknown',
      'defeated',
      'pending-new',
      'executed',
      'queued',
      'active-new',
      'active-old',
      'succeeded',
    ])
  })

  it('compares creation times numerically and does not mutate the input', () => {
    const input = [
      row('short', PROPOSAL_STATES.ACTIVE, 99),
      row('long', PROPOSAL_STATES.ACTIVE, 100),
    ]
    const sorted = sortProposals(input, 'newest', getState)
    expect(ids(sorted)).toEqual(['long', 'short'])
    expect(ids(input)).toEqual(['short', 'long'])
  })
})
