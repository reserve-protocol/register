import { describe, expect, it } from 'vitest'
import {
  formatCurrentProposalThreshold,
  getCurrentProposalThreshold,
  isProposalThresholdChanged,
  proposalThresholdToPercentage,
} from '../governance'

// The threshold field is seeded as a percentage — a raw/1e18 comparison never matches, appending a phantom calldata.
describe('isProposalThresholdChanged', () => {
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

describe('placeholder proposal threshold', () => {
  const exact = { proposalThreshold: 1, proposalThresholdExact: true }
  const placeholder = { proposalThreshold: 0.1, proposalThresholdExact: false }

  it('uses the indexed value only when it is the exact ratio', () => {
    expect(getCurrentProposalThreshold(exact)).toBe(1)
    expect(getCurrentProposalThreshold(placeholder)).toBeUndefined()
  })

  it('shows a dash instead of the placeholder value', () => {
    expect(formatCurrentProposalThreshold(getCurrentProposalThreshold(exact))).toBe('1.00%')
    expect(formatCurrentProposalThreshold(getCurrentProposalThreshold(placeholder))).toBe('—')
  })

  it('treats any value entered over a placeholder as a change', () => {
    const current = getCurrentProposalThreshold(placeholder)
    expect(isProposalThresholdChanged(0.1, current)).toBe(true)
    expect(isProposalThresholdChanged(1, current)).toBe(true)
  })
})
