import { describe, expect, it } from 'vitest'
import {
  filterCollaterals,
  getProtocolLabel,
  type CollateralFilters,
} from '../utils'

const plugins = [
  { symbol: 'wsAMM-eUSD/USDC', underlyingToken: 'sAMM-eUSD/USDC', chainId: 8453, protocol: 'AERODROME', targetName: 'USD' },
  { symbol: 'saBasUSDC', underlyingToken: 'USDC', chainId: 8453, protocol: 'AAVEv3', targetName: 'USD' },
  { symbol: 'wstETH', chainId: 1, protocol: 'GENERIC', targetName: 'ETH' },
]

const all: CollateralFilters = { search: '', chains: [], protocols: [], targets: [] }
const symbols = (filters: Partial<CollateralFilters>) =>
  filterCollaterals(plugins, { ...all, ...filters }).map((plugin) => plugin.symbol)

describe('filterCollaterals', () => {
  it('keeps every plugin when no filter is set', () => {
    expect(symbols({})).toHaveLength(3)
  })

  it('searches the collateral and its underlying, ignoring case', () => {
    expect(symbols({ search: 'usdc' })).toEqual(['wsAMM-eUSD/USDC', 'saBasUSDC'])
    expect(symbols({ search: ' WSTETH ' })).toEqual(['wstETH'])
  })

  it('combines network, protocol and target', () => {
    expect(symbols({ chains: ['8453'], protocols: ['AAVEv3'] })).toEqual(['saBasUSDC'])
    expect(symbols({ targets: ['ETH'] })).toEqual(['wstETH'])
    expect(symbols({ chains: ['1'], targets: ['USD'] })).toEqual([])
  })
})

describe('getProtocolLabel', () => {
  it('gives a readable name and falls back to the raw key', () => {
    expect(getProtocolLabel('MORPHOV2')).toBe('Morpho V2')
    expect(getProtocolLabel('SDR')).toBe('SDR')
  })
})
