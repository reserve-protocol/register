import type { Hex } from 'viem'

// Per-test mutable overlay consulted by every mock dispatcher (rpc / subgraph /
// api) BEFORE it falls back to snapshots. Lets a spec change what a boundary
// returns mid-test — e.g. after a vote tx, swap the proposal snapshot for one
// showing the new tally — then pump the frozen clock to trigger the refetch.
//
// It's a plain mutable object shared between the test body and the Playwright
// route handlers (both run in the same Node process), so mutations are seen on
// the next request with no route re-registration. A fresh instance is created
// per test by the `overrides` fixture, so state never leaks between tests.
//
// Keep it dumb: three explicit maps, three setters, three lookups. No matching
// magic beyond "exact key, else pathname substring for the api".
export class MockOverrides {
  // GraphQL operationName -> the `data` payload the subgraph should return.
  private subgraphOps = new Map<string, unknown>()
  // `${address}:${selector}` (both lowercased) -> eth_call return hex.
  private ethCalls = new Map<string, Hex>()
  // reserve-api pathname substring -> JSON body to return.
  private apiPaths = new Map<string, unknown>()

  // --- setters (called from the test body) ---

  // Override a subgraph operation. `data` is the object under GraphQL `data`,
  // e.g. overrides.subgraph('GetIndexDtfProposalVotingSnapshot', { proposal }).
  subgraph(operationName: string, data: unknown): void {
    this.subgraphOps.set(operationName, data)
  }

  // Override a single eth_call return. `returnHex` is the ABI-encoded result,
  // e.g. overrides.ethCall(governor, '0x544ffc9c', encodeAbiParameters(...)).
  ethCall(address: string, selector: string, returnHex: Hex): void {
    this.ethCalls.set(`${address.toLowerCase()}:${selector.toLowerCase()}`, returnHex)
  }

  // Override a reserve-api endpoint by pathname substring.
  api(pathIncludes: string, data: unknown): void {
    this.apiPaths.set(pathIncludes, data)
  }

  // --- lookups (called from the dispatchers; undefined = no override) ---

  lookupSubgraph(operationName: string | undefined): unknown | undefined {
    return operationName ? this.subgraphOps.get(operationName) : undefined
  }

  lookupEthCall(address: string, selector: string): Hex | undefined {
    return this.ethCalls.get(`${address.toLowerCase()}:${selector.toLowerCase()}`)
  }

  lookupApi(path: string): unknown | undefined {
    for (const [needle, data] of this.apiPaths) {
      if (path.includes(needle)) return data
    }
    return undefined
  }
}
