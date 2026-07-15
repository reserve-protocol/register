import { describe, expect, it, vi } from 'vitest'
import { Address } from 'viem'
import {
  DTFGovernanceResponse,
  fetchListedDTFGovernanceRows,
  mapGovernanceResponse,
} from '../hooks/use-listed-dtf-governance'
import { IndexDTFItem } from '@/hooks/useIndexDTFList'

const dtf = {
  id: '0x00000000000000000000000000000000000000aa' as Address,
  token: { name: 'DTF A', symbol: 'DTFA' },
  ownerGovernance: {
    id: '0x00000000000000000000000000000000000000b1' as Address,
    timelock: { id: '0x00000000000000000000000000000000000000b2' as Address },
  },
  tradingGovernance: {
    id: '0x00000000000000000000000000000000000000c1' as Address,
    timelock: { id: '0x00000000000000000000000000000000000000c2' as Address },
  },
}

describe('mapGovernanceResponse', () => {
  it('maps dtfs and enriches from the API data map', () => {
    const apiMap = new Map<string, IndexDTFItem>([
      [dtf.id.toLowerCase(), { marketCap: 42, brand: { icon: 'x' } } as IndexDTFItem],
    ])

    const rows = mapGovernanceResponse({ dtfs: [dtf] }, apiMap, 1)

    expect(rows).toHaveLength(1)
    expect(rows[0].symbol).toBe('DTFA')
    expect(rows[0].marketCap).toBe(42)
    expect(rows[0].icon).toBe('x')
    expect(rows[0].ownerTimelock).toBe(dtf.ownerGovernance.timelock.id)
  })

  it('returns [] on a partial response missing dtfs (Z5)', () => {
    const partial: Partial<DTFGovernanceResponse> = {} // dtfs omitted
    expect(() =>
      mapGovernanceResponse(partial as DTFGovernanceResponse, new Map(), 1)
    ).not.toThrow()
    expect(mapGovernanceResponse(undefined, new Map(), 1)).toEqual([])
  })
})

// Production-seam test (CXR-022-I1): the fan-out must degrade, not reject, when
// one chain's request fails. RED-verify by removing the per-chain try/catch in
// fetchListedDTFGovernanceRows — the whole Promise.all then rejects and this
// test throws instead of returning the healthy row.
describe('fetchListedDTFGovernanceRows degrades on a bad chain (Z5)', () => {
  const CHAINS = [1, 8453] as const
  const dtfsByChain = { 1: ['0xaaa'], 8453: [dtf.id.toLowerCase()] }
  const apiMap = new Map<string, IndexDTFItem>([
    [dtf.id.toLowerCase(), { marketCap: 7 } as IndexDTFItem],
  ])

  it('keeps the healthy chain when another chain rejects', async () => {
    const request = vi.fn((chainId: number) =>
      chainId === 1
        ? Promise.reject(new Error('chain 1 subgraph down'))
        : Promise.resolve({ dtfs: [dtf] })
    )

    const rows = await fetchListedDTFGovernanceRows(
      CHAINS,
      dtfsByChain,
      apiMap,
      request
    )

    // Chain 1 rejected, chain 8453 answered — result has only the healthy row.
    expect(rows).toHaveLength(1)
    expect(rows[0].chainId).toBe(8453)
    expect(rows[0].symbol).toBe('DTFA')
    expect(request).toHaveBeenCalledTimes(2)
  })
})
