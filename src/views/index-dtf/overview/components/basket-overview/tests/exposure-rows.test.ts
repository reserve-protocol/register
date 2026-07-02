import { ExposureGroup } from '@/state/dtf/atoms'
import { formatMarketCap } from '@/utils'
import { describe, expect, it } from 'vitest'
import { ExposureRow, getExposureMarketCap } from '../exposure-rows'

const makeGroup = (partial: Partial<ExposureGroup>): ExposureGroup =>
  ({ tokens: [], totalWeight: 0, ...partial }) as ExposureGroup

const tokenRow = (address: string): ExposureRow => ({
  kind: 'token',
  key: address,
  group: makeGroup({}),
  token: { address, symbol: 'TKN', weight: 1 },
  exchange: 'NASDAQ',
  weight: 1,
  change: null,
})

const groupRow = (group: ExposureGroup): ExposureRow => ({
  kind: 'group',
  key: 'g',
  group,
  weight: 1,
  change: null,
})

describe('getExposureMarketCap', () => {
  it('resolves token rows by lowercased address', () => {
    const caps = { '0xabc': 1_000_000 }
    expect(getExposureMarketCap(tokenRow('0xABC'), caps)).toBe(
      formatMarketCap(1_000_000)
    )
  })

  it('returns undefined for a token without a cap entry', () => {
    expect(getExposureMarketCap(tokenRow('0xabc'), {})).toBeUndefined()
    expect(getExposureMarketCap(tokenRow('0xabc'), undefined)).toBeUndefined()
  })

  it('resolves group rows by coingecko id when present', () => {
    const group = makeGroup({
      native: { coingeckoId: 'bitcoin' } as ExposureGroup['native'],
    })
    expect(getExposureMarketCap(groupRow(group), { bitcoin: 5 })).toBe(
      formatMarketCap(5)
    )
  })

  it('does not fall back to token address when a coingecko id has no cap', () => {
    const group = makeGroup({
      native: { coingeckoId: 'bitcoin' } as ExposureGroup['native'],
      tokens: [{ address: '0xdef', symbol: 'D', weight: 1 }],
    })
    expect(getExposureMarketCap(groupRow(group), { '0xdef': 9 })).toBeUndefined()
  })

  it('falls back to the first token address without a coingecko id', () => {
    const group = makeGroup({
      native: {} as ExposureGroup['native'],
      tokens: [{ address: '0xDEF', symbol: 'D', weight: 1 }],
    })
    expect(getExposureMarketCap(groupRow(group), { '0xdef': 9 })).toBe(
      formatMarketCap(9)
    )
  })

  it('returns undefined for a group with no tokens and no coingecko id', () => {
    const group = makeGroup({ native: {} as ExposureGroup['native'] })
    expect(getExposureMarketCap(groupRow(group), { x: 1 })).toBeUndefined()
  })

  it('treats a zero market cap as missing', () => {
    expect(getExposureMarketCap(tokenRow('0xabc'), { '0xabc': 0 })).toBeUndefined()
  })
})
