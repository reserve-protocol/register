import {
  getIndexDtfDisplayName,
  stripIndexDtfChainSuffix,
} from '@/utils/dtf-names'
import { describe, expect, it } from 'vitest'

describe('dtf display names', () => {
  it('normalizes stale Reserve API names to the canonical DTF display name', () => {
    expect(
      getIndexDtfDisplayName({
        name: 'Reserve AI NeoCloud DTF',
      })
    ).toBe('Reserve AI Capacity & Neocloud DTF')

    expect(
      getIndexDtfDisplayName({
        name: 'Reserve Photonics DTF',
      })
    ).toBe('Reserve AI Photonics DTF')
  })

  it('strips chain suffixes from onchain names for display', () => {
    expect(stripIndexDtfChainSuffix('Reserve AI Power DTF (BSC)')).toBe(
      'Reserve AI Power DTF'
    )
  })

  it('leaves names without known overrides unchanged', () => {
    expect(
      getIndexDtfDisplayName({
        name: 'Reserve AI Infrastructure DTF',
      })
    ).toBe('Reserve AI Infrastructure DTF')
  })
})
