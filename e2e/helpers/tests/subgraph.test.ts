import { describe, expect, it, vi } from 'vitest'
import { indexChainForUrl, resolveIndexQuery } from '../subgraph'
import { REGISTRY } from '../registry'

const base = REGISTRY.find((d) => d.chainId === 8453)! // lcap

function query(id: string) {
  return JSON.stringify({ operationName: 'GetIndexDTF', variables: { id } })
}

describe('index subgraph chain identity', () => {
  it('derives the chain from the dtf-index-<chain> URL', () => {
    expect(indexChainForUrl('https://…/subgraphs/dtf-index-base/prod/gn')).toBe(8453)
    expect(indexChainForUrl('https://…/subgraphs/dtf-index-bsc/prod/gn')).toBe(56)
    expect(indexChainForUrl('https://…/subgraphs/dtf-index-mainnet/prod/gn')).toBe(1)
  })

  it('serves a DTF from its own chain URL', () => {
    const log = vi.fn()
    const res = resolveIndexQuery(base.chainId, query(base.address), log) as {
      data?: unknown
      errors?: unknown
    }
    expect(res.errors).toBeUndefined()
    expect(res.data).toBeTruthy()
  })

  it('fails loud when a DTF is queried from the wrong chain URL', () => {
    const log = vi.fn()
    // base DTF, but the query arrived on the mainnet (chainId 1) subgraph URL.
    const res = resolveIndexQuery(1, query(base.address), log) as { errors?: unknown }
    expect(res.errors).toBeTruthy()
    expect(log).toHaveBeenCalledWith(
      'unmocked operation',
      expect.objectContaining({ reason: 'wrong-chain subgraph URL for DTF' })
    )
  })
})
