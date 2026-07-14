import type { Hex } from 'viem'
import { HoldRegistry } from '../harness/hold'

export type MockTransactionOutcome =
  | { kind: 'success' | 'revert'; pendingPolls?: number }
  | { kind: 'reject'; code?: number; message?: string }

interface SubgraphOverride {
  operationName: string
  variables: Record<string, unknown>
  data: unknown
}

interface ApiOverride {
  method: string
  pathname: string
  search: Record<string, string>
  data: unknown
}

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
// Matching is deliberately explicit: operation + selected variables, exact
// method/path + selected query fields, and address + full calldata.
export class MockOverrides {
  private subgraphOps: SubgraphOverride[] = []
  // `${address}:${calldata}` (both lowercased) -> eth_call return hex. A
  // selector-only key is allowed only for no-argument functions.
  private ethCalls = new Map<string, Hex>()
  private apiRequests: ApiOverride[] = []
  private transactionOutcomes: MockTransactionOutcome[] = []
  // lowercased address -> native balance in wei (eth_getBalance). Opt-in:
  // everyone else keeps the shared 100 ETH default.
  private ethBalances = new Map<string, bigint>()

  // Controllable-latency gates for the loading lifecycle. Dispatchers call
  // `holds.gate(identity)` before fulfilling; the harness `mock.hold()` adds one.
  readonly holds = new HoldRegistry()

  // --- setters (called from the test body) ---

  // Override a subgraph operation. `data` is the object under GraphQL `data`,
  // e.g. overrides.subgraph('GetIndexDtfProposalVotingSnapshot', { proposal }).
  subgraph(
    match: { operationName: string; variables?: Record<string, unknown> },
    data: unknown
  ): void {
    this.subgraphOps.push({
      operationName: match.operationName,
      variables: match.variables ?? {},
      data,
    })
  }

  // Override a single eth_call return. `returnHex` is the ABI-encoded result.
  // The full calldata is required, including encoded arguments.
  ethCall(address: string, calldata: string, returnHex: Hex): void {
    this.ethCalls.set(`${address.toLowerCase()}:${calldata.toLowerCase()}`, returnHex)
  }

  // Override the native balance one address reports via eth_getBalance —
  // e.g. fund the test wallet past the 100 ETH default so an expensive
  // high-impact quote is affordable and the impact gate renders.
  ethBalance(address: string, wei: bigint): void {
    this.ethBalances.set(address.toLowerCase(), wei)
  }

  // Override an exact reserve-api method/path, optionally constraining the
  // relevant query-string identity fields.
  api(
    match: { method?: string; pathname: string; search?: Record<string, string> },
    data: unknown
  ): void {
    this.apiRequests.push({
      method: match.method ?? 'GET',
      pathname: match.pathname,
      search: match.search ?? {},
      data,
    })
  }

  transaction(outcome: MockTransactionOutcome): void {
    this.transactionOutcomes.push(outcome)
  }

  // --- lookups (called from the dispatchers; undefined = no override) ---

  lookupSubgraph(
    operationName: string | undefined,
    variables: Record<string, unknown>
  ): unknown | undefined {
    if (!operationName) return undefined
    return this.subgraphOps.findLast(
      (entry) =>
        entry.operationName === operationName &&
        entriesMatch(entry.variables, variables)
    )?.data
  }

  lookupEthCall(address: string, calldata: string): Hex | undefined {
    return this.ethCalls.get(`${address.toLowerCase()}:${calldata.toLowerCase()}`)
  }

  lookupEthBalance(address: string): bigint | undefined {
    return this.ethBalances.get(address.toLowerCase())
  }

  lookupApi(method: string, url: URL): unknown | undefined {
    return this.apiRequests.findLast(
      (entry) =>
        entry.method === method &&
        entry.pathname === url.pathname &&
        entriesMatch(entry.search, Object.fromEntries(url.searchParams))
    )?.data
  }

  consumeTransactionOutcome(): MockTransactionOutcome {
    return this.transactionOutcomes.shift() ?? { kind: 'success', pendingPolls: 1 }
  }
}

function entriesMatch(
  expected: Record<string, unknown>,
  actual: Record<string, unknown>
): boolean {
  return Object.entries(expected).every(
    ([key, value]) => JSON.stringify(actual[key]) === JSON.stringify(value)
  )
}
