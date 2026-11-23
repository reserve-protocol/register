import { describe, expect, it } from 'vitest'
import {
  getConfirmationProposalId,
  isVotingClosedEarly,
} from '../challenged-proposal'

describe('getConfirmationProposalId', () => {
  const proposals = [
    { id: '11', challengedProposalId: undefined },
    { id: '22', challengedProposalId: '7' },
  ]

  it('finds the standard proposal that replaces a challenged fast proposal', () => {
    expect(getConfirmationProposalId('7', proposals)).toBe('22')
  })

  it('returns undefined while the replacement is not indexed', () => {
    expect(getConfirmationProposalId('8', proposals)).toBeUndefined()
    expect(getConfirmationProposalId('7', undefined)).toBeUndefined()
  })
})

describe('isVotingClosedEarly', () => {
  it('is true when a final state arrives before the vote end', () => {
    expect(isVotingClosedEarly({ state: 'DEFEATED', voteEnd: 200 }, 100)).toBe(
      true
    )
  })

  it('is false while the vote is pending or active', () => {
    expect(isVotingClosedEarly({ state: 'ACTIVE', voteEnd: 200 }, 100)).toBe(
      false
    )
    expect(isVotingClosedEarly({ state: 'PENDING', voteEnd: 200 }, 100)).toBe(
      false
    )
  })

  it('is false after the vote end', () => {
    expect(isVotingClosedEarly({ state: 'DEFEATED', voteEnd: 200 }, 300)).toBe(
      false
    )
  })
})
