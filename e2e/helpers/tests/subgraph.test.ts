import { describe, expect, it, vi } from 'vitest'
import { resolveIndexQuery } from '../subgraph'
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
