import type { Page } from '@playwright/test'
import type { Address, Hex } from 'viem'
import { advanceTime, freezeTime } from '../helpers/clock'
import type { MockOverrides } from '../helpers/overrides'
import type { TxRecord } from '../helpers/provider'
import type { BoundaryRequest } from '../helpers/requests'
import {
  dtfPath,
  rtokenPath,
  TEST_ADDRESS,
  type RegistryDTF,
  type YieldDTF,
} from '../helpers/registry'
import { seedDtfBalance } from '../helpers/zapper'
import type { HoldHandle } from './hold'
import { connectWallet } from '../fixtures/wallet'
import { seedFeeRegistry, seedManualIssuance, type SeedManualOpts } from './seed'

export interface HarnessDeps {
  readonly overrides: MockOverrides
  readonly txLog: TxRecord[]
  readonly boundaryRequests: BoundaryRequest[]
  // The chain the injected wallet reports (from the `walletChain` fixture option).
  readonly walletChain: number
}

// Block / timestamp control. `freezeAt` installs the browser+node clocks in
// lockstep; `advance` moves both to fire polling/refetch under a frozen clock.
class ChainControl {
  constructor(private readonly page: Page) {}
  freezeAt(seconds: number): Promise<void> {
    return freezeTime(this.page, seconds)
  }
  advance(ms: number): Promise<void> {
    return advanceTime(this.page, ms)
  }
}

// The injected EIP-6963 test wallet (account = TEST_ADDRESS). `chain` reflects
// the `walletChain` fixture option — set it away from a DTF's chain for
// wrong-chain / switch-network coverage.
class WalletControl {
  constructor(
    private readonly page: Page,
    readonly chain: number
  ) {}
  readonly account = TEST_ADDRESS as Address
  connect(): Promise<void> {
    return connectWallet(this.page)
  }
}

// Queue the NEXT transaction's outcome + read the decoded send log. Outcomes are
// consumed FIFO by the wallet provider, so chain them for multi-tx flows.
class TxControl {
  constructor(private readonly deps: HarnessDeps) {}
  confirm(pendingPolls = 1): this {
    this.deps.overrides.transaction({ kind: 'success', pendingPolls })
    return this
  }
  revert(pendingPolls = 1): this {
    this.deps.overrides.transaction({ kind: 'revert', pendingPolls })
    return this
  }
  // User rejects the signature in the wallet.
  decline(message?: string): this {
    this.deps.overrides.transaction({ kind: 'reject', ...(message ? { message } : {}) })
    return this
  }
  get log(): readonly TxRecord[] {
    return this.deps.txLog
  }
  last(): TxRecord | undefined {
    return this.deps.txLog[this.deps.txLog.length - 1]
  }
}

// Per-test response overrides + the lifecycle hold gate.
class MockControl {
  constructor(private readonly overrides: MockOverrides) {}
  subgraph(
    match: { operationName: string; variables?: Record<string, unknown> },
    data: unknown
  ): this {
    this.overrides.subgraph(match, data)
    return this
  }
  api(match: { method?: string; pathname: string; search?: Record<string, string> }, data: unknown): this {
    this.overrides.api(match, data)
    return this
  }
  ethCall(address: string, calldata: string, returnHex: Hex): this {
    this.overrides.ethCall(address, calldata, returnHex)
    return this
  }
  balance(address: string, wei: bigint): this {
    this.overrides.ethBalance(address, wei)
    return this
  }
  // Freeze a boundary so its requests park until release() — the L1/L2 seam.
  hold(matcher: Parameters<MockOverrides['holds']['add']>[0]): HoldHandle {
    return this.overrides.holds.add(matcher)
  }
}

// Typed read views over the recorded boundary traffic — assert source, chain,
// identity, and counts instead of only the rendered shell.
class RequestsView {
  constructor(private readonly requests: BoundaryRequest[]) {}
  all(): readonly BoundaryRequest[] {
    return this.requests
  }
  subgraph(op?: string): Extract<BoundaryRequest, { boundary: 'subgraph' }>[] {
    return this.requests.filter(
      (r): r is Extract<BoundaryRequest, { boundary: 'subgraph' }> =>
        r.boundary === 'subgraph' && (op === undefined || r.operationName === op)
    )
  }
  api(pathname?: string): Extract<BoundaryRequest, { boundary: 'api' }>[] {
    return this.requests.filter(
      (r): r is Extract<BoundaryRequest, { boundary: 'api' }> =>
        r.boundary === 'api' && (pathname === undefined || r.pathname.includes(pathname))
    )
  }
  rpc(method?: string): Extract<BoundaryRequest, { boundary: 'rpc' }>[] {
    return this.requests.filter(
      (r): r is Extract<BoundaryRequest, { boundary: 'rpc' }> =>
        r.boundary === 'rpc' && (method === undefined || r.method === method)
    )
  }
  // Every subgraph/api request whose identity mentions this address (lowercased)
  // — the seam that caught the wrong-chain routing bug.
  naming(address: string): BoundaryRequest[] {
    const needle = address.toLowerCase()
    return this.requests.filter((r) => {
      if (r.boundary === 'subgraph') return JSON.stringify(r.variables).toLowerCase().includes(needle)
      if (r.boundary === 'api') return JSON.stringify(r.search).toLowerCase().includes(needle)
      return false
    })
  }
}

// One controller per test — the single entry every spec composes from.
// Scalable for every DTF: `goto`/`gotoYield`/`seedBalance` take any registry
// entry, so the same spec body runs across chains and fixtures.
export class DtfHarness {
  readonly chain: ChainControl
  readonly wallet: WalletControl
  readonly tx: TxControl
  readonly mock: MockControl
  readonly requests: RequestsView

  constructor(
    readonly page: Page,
    private readonly deps: HarnessDeps
  ) {
    this.chain = new ChainControl(page)
    this.wallet = new WalletControl(page, deps.walletChain)
    this.tx = new TxControl(deps)
    this.mock = new MockControl(deps.overrides)
    this.requests = new RequestsView(deps.boundaryRequests)
  }

  // Navigate to an Index DTF sub-page (overview/issuance/governance/…). The DTF's
  // chain comes from the registry entry, so the same call works for any chain.
  goto(dtf: RegistryDTF, subpage = 'overview'): Promise<unknown> {
    return this.page.goto(dtfPath(dtf, subpage))
  }

  // Navigate to a Yield DTF (RToken) sub-page.
  gotoYield(dtf: YieldDTF, subpage = 'overview'): Promise<unknown> {
    return this.page.goto(rtokenPath(dtf, subpage))
  }

  // Seed the connected wallet's balance + allowance for this DTF (sell/redeem).
  seedBalance(dtf: RegistryDTF, amount: string): this {
    seedDtfBalance(this.deps.overrides, dtf.address, amount)
    return this
  }

  // Seed every read the MANUAL issuance page fires (toAssets quote + symbol +
  // per-basket-token balance/allowance/USDT-probe) so a connected wallet lands
  // on a fundable, no-unmocked-call manual panel.
  seedManualIssuance(dtf: RegistryDTF, opts?: SeedManualOpts): this {
    seedManualIssuance(this.deps.overrides, dtf, opts)
    return this
  }

  // Seed the DAO fee registry (platform fee % = numerator*100/denominator).
  seedFeeRegistry(dtf: RegistryDTF, numerator: bigint, denominator: bigint): this {
    seedFeeRegistry(this.deps.overrides, dtf, numerator, denominator)
    return this
  }
}
