import { describe, expect, it, vi } from 'vitest'
import { resolveIndexQuery, resolveYieldQuery } from '../subgraph'
import { REGISTRY } from '../registry'

const base = REGISTRY.find((d) => d.chainId === 8453)! // lcap

function query(id: string) {
  return JSON.stringify({ operationName: 'GetIndexDTF', variables: { id } })
}

describe('index subgraph resolution', () => {
  it('serves a DTF by its globally-unique address', () => {
    const log = vi.fn()
    const res = resolveIndexQuery(query(base.address), log) as {
      data?: unknown
      errors?: unknown
    }
    expect(res.errors).toBeUndefined()
    expect(res.data).toBeTruthy()
    // Resolves by address regardless of the querying chain — the app fires
    // transient cross-chain queries before chainIdAtom settles (see resolver).
    expect(log).not.toHaveBeenCalled()
  })

  it('fails loud for an unknown DTF address', () => {
    const log = vi.fn()
    const res = resolveIndexQuery(
      query('0x00000000000000000000000000000000deadbeef'),
      log
    ) as { errors?: unknown }
    expect(res.errors).toBeTruthy()
  })
})

describe('explorer aggregation branches (shape guards GH0)', () => {
  it('getAllIndexProposals returns a proposals ARRAY (not undefined)', () => {
    const log = vi.fn()
    const res = resolveIndexQuery(
      JSON.stringify({ operationName: 'getAllIndexProposals', variables: { voter: '0x0' } }),
      log
    ) as { data?: { proposals?: unknown } }
    // The hook iterates result.proposals unguarded — the field must be an array.
    expect(Array.isArray(res.data?.proposals)).toBe(true)
    expect(log).not.toHaveBeenCalled()
  })

  it('getDTFGovernance returns a dtfs ARRAY (not undefined)', () => {
    const log = vi.fn()
    const res = resolveIndexQuery(
      JSON.stringify({ operationName: 'getDTFGovernance', variables: { ids: [] } }),
      log
    ) as { data?: { dtfs?: unknown } }
    expect(Array.isArray(res.data?.dtfs)).toBe(true)
    expect(log).not.toHaveBeenCalled()
  })

  it('explorer Transactions returns an entries ARRAY on the yield subgraph', () => {
    const log = vi.fn()
    const res = resolveYieldQuery(
      8453,
      JSON.stringify({ operationName: 'Transactions', variables: {} }),
      log
    ) as { data?: { entries?: unknown } }
    // useTransactionData reads data[chain].entries.map — the field must exist as
    // an array or the whole explorer crashes (GH0).
    expect(Array.isArray(res.data?.entries)).toBe(true)
    expect(log).not.toHaveBeenCalled()
  })
})
