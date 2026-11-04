import { describe, expect, it } from 'vitest'
import { getProposalTitle } from '..'

describe('getProposalTitle', () => {
  it('drops the markdown heading marks', () => {
    expect(getProposalTitle('# Fees: 0.30% Mint Fee\n[]()\nbody')).toBe(
      'Fees: 0.30% Mint Fee'
    )
  })

  it('keeps a # inside the title', () => {
    expect(getProposalTitle('Upgrade vote-lock governance to 1.1.0 #1')).toBe(
      'Upgrade vote-lock governance to 1.1.0 #1'
    )
  })

  it('reads the first line of an escaped description', () => {
    expect(getProposalTitle('## Rebalance #2\\nbody')).toBe('Rebalance #2')
  })
})
