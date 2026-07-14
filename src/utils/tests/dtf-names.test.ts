import { stripIndexDtfChainSuffix } from '@/utils/dtf-names'
import { describe, expect, it } from 'vitest'

describe('dtf display names', () => {
  it('strips chain suffixes from onchain names for display', () => {
    expect(stripIndexDtfChainSuffix('Reserve AI Power DTF (BSC)')).toBe(
      'Reserve AI Power DTF'
    )
  })
})
