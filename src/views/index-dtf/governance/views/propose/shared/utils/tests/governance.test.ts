import { describe, expect, it } from 'vitest'
import {
  isProposalThresholdChanged,
  proposalThresholdToPercentage,
} from '../governance'

// The threshold field is seeded as a percentage — a raw/1e18 comparison never matches, appending a phantom calldata.
describe('isProposalThresholdChanged (E1)', () => {
  it('a seeded-then-untouched value is NOT a change', () => {
    const governanceThreshold = 0.01
    const seeded = proposalThresholdToPercentage(governanceThreshold)
    expect(isProposalThresholdChanged(seeded, governanceThreshold)).toBe(false)
  })

  it('a real edit IS a change', () => {
    expect(isProposalThresholdChanged(0.5, 0.01)).toBe(true)
  })

  it('the old raw/1e18 basis would have flagged the untouched value (the bug)', () => {
    const governanceThreshold = 0.01
    const seeded = proposalThresholdToPercentage(governanceThreshold)
    const oldBasis = Number(governanceThreshold) / 1e18
    expect(seeded !== oldBasis).toBe(true)
    expect(isProposalThresholdChanged(seeded, governanceThreshold)).toBe(false)
  })
})
