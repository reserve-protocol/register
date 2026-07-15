import { describe, expect, it } from 'vitest'
import { isRebalanceOngoing } from '../utils'

const NOW = 1_700_000_000

describe('isRebalanceOngoing (Z29 poll gate)', () => {
  it('is ongoing while availableUntil is in the future', () => {
    expect(isRebalanceOngoing(String(NOW + 3600), NOW)).toBe(true)
  })

  it('is ongoing exactly at the window boundary', () => {
    expect(isRebalanceOngoing(String(NOW), NOW)).toBe(true)
  })

  it('is NOT ongoing once availableUntil has passed (completed/historical)', () => {
    expect(isRebalanceOngoing(String(NOW - 1), NOW)).toBe(false)
  })

  it('is NOT ongoing when the window is missing', () => {
    expect(isRebalanceOngoing(undefined, NOW)).toBe(false)
  })

  it('is NOT ongoing when the window is non-numeric (fails toward off)', () => {
    expect(isRebalanceOngoing('not-a-number', NOW)).toBe(false)
  })
})
