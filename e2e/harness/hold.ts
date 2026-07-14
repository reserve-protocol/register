// Controllable-latency gate for the loading lifecycle.
//
// A spec registers a hold on a boundary (e.g. the GetIndexDTF subgraph call);
// every mock dispatcher (rpc/subgraph/api) calls `gate()` before it fulfills, so
// a matching request PARKS until the test calls `release()`. That lets a spec
// freeze L1 (skeleton) and L2 (one island resolved, others still parked), assert
// the frozen UI, then release and assert the resolved UI in the same box.
//
// Pure and page-free: the registry is a plain object shared between the test body
// and the Playwright route handlers (same Node process), so it is unit-testable
// on its own (see helpers/tests/harness-hold.test.ts).

export type HoldMatcher =
  | { readonly boundary: 'subgraph'; readonly operationName?: string }
  | { readonly boundary: 'api'; readonly pathname?: string }
  // `selector` (4-byte calldata prefix) + `to` isolate ONE eth_call island
  // (e.g. toAssets 0xd17618bf) from others on the same contract (totalAssets).
  | { readonly boundary: 'rpc'; readonly method?: string; readonly selector?: string; readonly to?: string }

export type HoldBoundary = HoldMatcher['boundary']

// Identity a dispatcher passes to `gate()` at request time.
export type HoldIdentity =
  | { readonly boundary: 'subgraph'; readonly operationName: string }
  | { readonly boundary: 'api'; readonly pathname: string }
  | {
      readonly boundary: 'rpc'
      readonly method: string
      readonly to?: string
      readonly data?: string
      // Inner calls when this is a multicall3 aggregate — lets a selector/`to`
      // hold target a batched read (most app reads are batched).
      readonly inner?: ReadonlyArray<{ readonly to?: string; readonly data?: string }>
    }

export interface HoldHandle {
  // Release every request currently parked on this hold and let future matches
  // pass straight through.
  release(): void
  readonly released: boolean
  // How many requests this hold has parked (for asserting a spec actually froze
  // the boundary it intended to).
  readonly hits: number
}

interface Hold {
  matcher: HoldMatcher
  gate: Promise<void>
  open: () => void
  released: boolean
  hits: number
}

function matches(matcher: HoldMatcher, identity: HoldIdentity): boolean {
  if (matcher.boundary !== identity.boundary) return false
  if (matcher.boundary === 'subgraph' && identity.boundary === 'subgraph') {
    return matcher.operationName === undefined || matcher.operationName === identity.operationName
  }
  if (matcher.boundary === 'api' && identity.boundary === 'api') {
    // pathname is a substring match so `/current/dtf` catches the full path.
    return matcher.pathname === undefined || identity.pathname.includes(matcher.pathname)
  }
  if (matcher.boundary === 'rpc' && identity.boundary === 'rpc') {
    if (matcher.method !== undefined && matcher.method !== identity.method) return false
    // `to`/`selector` match the top-level call OR any inner (batched) call.
    if (matcher.to === undefined && matcher.selector === undefined) return true
    const calls = [{ to: identity.to, data: identity.data }, ...(identity.inner ?? [])]
    return calls.some((call) => matchesRpcCall(matcher, call))
  }
  return false
}

function matchesRpcCall(
  matcher: { to?: string; selector?: string },
  call: { to?: string; data?: string }
): boolean {
  if (matcher.to !== undefined && matcher.to.toLowerCase() !== call.to?.toLowerCase()) return false
  if (
    matcher.selector !== undefined &&
    !(call.data ?? '').toLowerCase().startsWith(matcher.selector.toLowerCase())
  ) {
    return false
  }
  return true
}

export class HoldRegistry {
  private holds: Hold[] = []

  // test-side: park matching requests until the returned handle is released.
  add(matcher: HoldMatcher): HoldHandle {
    let open!: () => void
    const gate = new Promise<void>((resolve) => (open = resolve))
    const hold: Hold = { matcher, gate, open, released: false, hits: 0 }
    this.holds.push(hold)
    return {
      release() {
        hold.released = true
        hold.open()
      },
      get released() {
        return hold.released
      },
      get hits() {
        return hold.hits
      },
    }
  }

  // dispatcher-side: await the first matching un-released hold, if any.
  async gate(identity: HoldIdentity): Promise<void> {
    const hold = this.holds.find((h) => !h.released && matches(h.matcher, identity))
    if (!hold) return
    hold.hits++
    await hold.gate
  }

  // teardown safety — release everything so a forgotten hold can't hang teardown.
  releaseAll(): void {
    for (const hold of this.holds) {
      hold.released = true
      hold.open()
    }
  }
}
