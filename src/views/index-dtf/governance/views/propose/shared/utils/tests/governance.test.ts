import { describe, expect, it } from 'vitest'
import {
  isProposalThresholdChanged,
  proposalThresholdToPercentage,
} from '../governance'

// E1 (docs/plans/REGISTER_HARDENING.md). The threshold form field is seeded from
// proposalThresholdToPercentage (already a percentage), so the change-detector
// must compare against the SAME percentage basis. The old basket-settings
// updater compared the field to Number(threshold) / 1e18, which never matched
// the seeded value → every proposal appended a phantom setProposalThreshold
// calldata and the empty-change guard never tripped.
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
    // The phantom: the seeded percentage never equals raw/1e18.
    expect(seeded !== oldBasis).toBe(true)
    // The fix compares like-for-like, so the untouched value reads as no change.
    expect(isProposalThresholdChanged(seeded, governanceThreshold)).toBe(false)
  })
})
