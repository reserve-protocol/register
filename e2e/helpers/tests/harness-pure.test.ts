import type { Page } from '@playwright/test'
import { describe, expect, it } from 'vitest'
import { MockOverrides } from '../overrides'
import type { BoundaryRequest } from '../requests'
import { DtfHarness } from '../../harness/controller'
import { maxDelta } from '../../harness/lifecycle'

// Constructor stores `page` without touching it, so the page-free views
// (requests / mock.hold) are unit-testable with a stub page.
function makeHarness(boundaryRequests: BoundaryRequest[]) {
  const overrides = new MockOverrides()
  return new DtfHarness({} as unknown as Page, {
    overrides,
    txLog: [],
    boundaryRequests,
    walletChain: 8453,
  })
}

const SAMPLE: BoundaryRequest[] = [
  { boundary: 'subgraph', operationName: 'GetIndexDTF', variables: { id: '0xABC' }, urlChain: 8453 },
  { boundary: 'subgraph', operationName: 'GetIndexDtfProposals', variables: {}, urlChain: 8453 },
  { boundary: 'api', method: 'GET', pathname: '/current/dtf', search: { address: '0xABC', chainId: '8453' } },
  { boundary: 'rpc', chainId: 8453, method: 'eth_call', params: [] },
]

describe('harness lifecycle.maxDelta', () => {
  it('is 0 for identical boxes', () => {
    const b = { x: 10, y: 20, width: 100, height: 40 }
    expect(maxDelta(b, { ...b })).toBe(0)
  })
  it('returns the largest single-axis movement', () => {
    expect(
      maxDelta({ x: 0, y: 0, width: 100, height: 40 }, { x: 3, y: 0, width: 100, height: 47 })
    ).toBe(7) // height moved most
  })
})

describe('harness RequestsView', () => {
  it('filters subgraph by operationName', () => {
    const h = makeHarness(SAMPLE)
    expect(h.requests.subgraph().length).toBe(2)
    expect(h.requests.subgraph('GetIndexDTF').length).toBe(1)
    expect(h.requests.subgraph('Nope').length).toBe(0)
  })
  it('filters api by pathname substring', () => {
    const h = makeHarness(SAMPLE)
    expect(h.requests.api('/current/dtf').length).toBe(1)
    expect(h.requests.api('/discover').length).toBe(0)
  })
  it('filters rpc by method', () => {
    const h = makeHarness(SAMPLE)
    expect(h.requests.rpc('eth_call').length).toBe(1)
    expect(h.requests.rpc('eth_blockNumber').length).toBe(0)
  })
  it('naming() matches subgraph variables AND api search, case-insensitive', () => {
    const h = makeHarness(SAMPLE)
    const named = h.requests.naming('0xabc')
    expect(named.length).toBe(2) // the GetIndexDTF subgraph + the /current/dtf api
    expect(named.some((r) => r.boundary === 'subgraph')).toBe(true)
    expect(named.some((r) => r.boundary === 'api')).toBe(true)
  })
})

describe('harness mock.hold delegates to the shared registry', () => {
  it('a hold added via the harness parks the matching dispatcher gate', async () => {
    const overrides = new MockOverrides()
    const h = new DtfHarness({} as unknown as Page, {
      overrides,
      txLog: [],
      boundaryRequests: [],
      walletChain: 8453,
    })
    const handle = h.mock.hold({ boundary: 'subgraph', operationName: 'GetIndexDTF' })
    let resolved = false
    // the dispatcher would call overrides.holds.gate(...)
    void overrides.holds.gate({ boundary: 'subgraph', operationName: 'GetIndexDTF' }).then(() => {
      resolved = true
    })
    await Promise.resolve()
    expect(resolved).toBe(false)
    expect(handle.hits).toBe(1)
    handle.release()
    await Promise.resolve()
    await Promise.resolve()
    expect(resolved).toBe(true)
  })
})
