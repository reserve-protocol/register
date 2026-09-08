import { describe, expect, it } from 'vitest'
import { getVotingPeriodTiming } from '../voting-period-timing'

describe('getVotingPeriodTiming', () => {
  it('shows only the start countdown before voting begins', () => {
    expect(
      getVotingPeriodTiming({
        status: 'PENDING',
        votingStartsIn: 3_600,
        votingEndsIn: 90_000,
      })
    ).toEqual({ starts: 3_600, ends: null })
  })

  it('shows only the end countdown while voting is active', () => {
    expect(
      getVotingPeriodTiming({
        status: 'ACTIVE',
        votingStartsIn: -60,
        votingEndsIn: 86_400,
      })
    ).toEqual({ starts: 'passed', ends: 86_400 })
  })

  it('marks both boundaries as passed after voting ends', () => {
    expect(
      getVotingPeriodTiming({
        status: 'SUCCEEDED',
        votingStartsIn: -90_000,
        votingEndsIn: -3_600,
      })
    ).toEqual({ starts: 'passed', ends: 'passed' })
  })

  it('does not count down future boundaries for a canceled proposal', () => {
    expect(
      getVotingPeriodTiming({
        status: 'CANCELED',
        votingStartsIn: 3_600,
        votingEndsIn: 90_000,
      })
    ).toEqual({ starts: null, ends: null })
  })

  it('leaves unavailable chain timing blank', () => {
    expect(
      getVotingPeriodTiming({
        status: 'PENDING',
        votingStartsIn: Number.NaN,
        votingEndsIn: Number.NaN,
      })
    ).toEqual({ starts: null, ends: null })
  })
})
