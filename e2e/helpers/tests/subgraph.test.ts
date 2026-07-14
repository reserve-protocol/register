import { describe, expect, it, vi } from 'vitest'
import { resolveIndexQuery, resolveYieldQuery } from '../subgraph'
import { MockOverrides } from '../overrides'
import { REGISTRY } from '../registry'

const base = REGISTRY.find((d) => d.chainId === 8453)! // lcap
const otherChain = base.chainId === 1 ? 8453 : 1

function query(id: string) {
  return JSON.stringify({ operationName: 'GetIndexDTF', variables: { id } })
}

describe('index subgraph resolution', () => {
  it('serves a DTF by its globally-unique address (no urlChain = no enforcement)', () => {
    const log = vi.fn()
    const res = resolveIndexQuery(query(base.address), log) as {
      data?: unknown
      errors?: unknown
    }
    expect(res.errors).toBeUndefined()
    expect(res.data).toBeTruthy()
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

describe('index subgraph chain enforcement (HARN-001/002)', () => {
  it('serves a DTF on its OWN registry-chain subgraph host', () => {
    const log = vi.fn()
    const res = resolveIndexQuery(query(base.address), log, undefined, base.chainId) as {
      data?: unknown
      errors?: unknown
    }
    expect(res.errors).toBeUndefined()
    expect(res.data).toBeTruthy()
  })

  it('REFUSES the same address requested on the wrong-chain host', () => {
    const log = vi.fn()
    const res = resolveIndexQuery(query(base.address), log, undefined, otherChain) as {
      errors?: { message: string }[]
      data?: unknown
    }
    // A valid address sent to the wrong host must not be served (the exact
    // regression this suite exists to catch).
    expect(res.errors?.[0]?.message).toContain('wrong-chain')
    expect(res.data).toBeNull()
  })

  it('a per-test overlay CANNOT bypass chain validation (HARN-002)', () => {
    const log = vi.fn()
    const overrides = new MockOverrides()
    overrides.subgraph({ operationName: 'GetIndexDTF' }, { dtf: { id: base.address } })
    const res = resolveIndexQuery(query(base.address), log, overrides, otherChain) as {
      errors?: { message: string }[]
    }
    // Chain is validated BEFORE the overlay applies.
    expect(res.errors?.[0]?.message).toContain('wrong-chain')
  })

  // A proposal-only op (voting snapshot) carries no dtf address — only proposalId.
  // It must still be chain-gated via the proposal's owning DTF (HARN-002).
  const baseProposalId =
    '2629873563842112205099096145487311195441039990876081182824485379326727057953' // base/deprecated
  const votingSnapshot = (proposalId: string) =>
    JSON.stringify({
      operationName: 'GetIndexDtfProposalVotingSnapshot',
      variables: { proposalId },
    })

  it('serves a proposal-only op on the proposal owner-chain host', () => {
    const log = vi.fn()
    const res = resolveIndexQuery(votingSnapshot(baseProposalId), log, undefined, base.chainId) as {
      data?: unknown
      errors?: unknown
    }
    expect(res.errors).toBeUndefined()
    expect(res.data).toBeTruthy()
  })

  it('REFUSES a proposal-only op requested on the wrong-chain host (HARN-002 proposal path)', () => {
    const log = vi.fn()
    const res = resolveIndexQuery(votingSnapshot(baseProposalId), log, undefined, otherChain) as {
      errors?: { message: string }[]
      data?: unknown
    }
    expect(res.errors?.[0]?.message).toContain('wrong-chain')
    expect(res.data).toBeNull()
  })

  // getGovernanceStats keys on a chain-specific governor id (`governanceIds`),
  // which is not a `id`/`dtf`/`proposalId` var — it must still be chain-gated.
  const baseGovId = '0x719eded05c7a6468e44acfbbd19b2df2eed7759e' // base/lcap ownerGovernance
  const govStats = (governanceIds: string[]) =>
    JSON.stringify({ operationName: 'getGovernanceStats', variables: { governanceIds } })

  it('serves a governance-stats op on the governor owner-chain host', () => {
    const log = vi.fn()
    const res = resolveIndexQuery(govStats([baseGovId]), log, undefined, base.chainId) as {
      errors?: unknown
    }
    expect(res.errors).toBeUndefined()
  })

  it('REFUSES a governance-stats governor id requested on the wrong-chain host (HARN-002 gov path)', () => {
    const log = vi.fn()
    const res = resolveIndexQuery(govStats([baseGovId]), log, undefined, otherChain) as {
      errors?: { message: string }[]
      data?: unknown
    }
    expect(res.errors?.[0]?.message).toContain('wrong-chain')
    expect(res.data).toBeNull()
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
