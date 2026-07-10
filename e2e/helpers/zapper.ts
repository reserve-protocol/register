import type { Page } from '@playwright/test'
import { encodeAbiParameters, parseUnits } from 'viem'
import type { UnmockedLogger } from './logger'
import type { MockOverrides } from './overrides'
import { findDtfByAddress } from './registry'
import { loadSnapshot, loadSnapshotRaw, snapshotExists } from './snapshots'

// Zapper (buy/sell) mock boundary — owned by the zap specs ONLY.
//
// The @reserve-protocol/react-zapper widget (issuance page, swap panel) quotes
// through TWO endpoint families on api.reserve.org, both derived from
// ZAPPER_API/RESERVE_API in src/utils/constants.ts:
//
//   native zap:  /api/zapper/{chainId}/swap?chainId&signer&tokenIn&amountIn
//                  &tokenOut&slippage&trade&bypassCache&deepLiquidity
//   aggregators: /{odos|velora|enso}/swap?chainId&tokenIn&tokenOut&amountIn
//                  &slippage&signer
//
// In its default "best" mode the widget fires ALL enabled providers in
// parallel and picks the best quote by minAmountOut (ties prefer zap). We mock
// the native zap endpoint from captured snapshots and answer every aggregator
// with a deterministic provider-level error: the widget then has exactly one
// successful candidate, which (a) makes "best" mode deterministic and (b)
// skips the candidate tx-simulation pass (it only runs with >= 2 candidates).
//
// Quote snapshots live at snapshots/<chain>/<slug>/zap-{buy,sell}.json with the
// pinned request params recorded in _meta.params. A request matching the pinned
// (chainId, tokenIn, tokenOut, amountIn) gets the snapshot; anything else is a
// fail-loud 500 + `[E2E] unmocked zap quote` — specs must pin their inputs to
// the captured amounts. signer/slippage are deliberately NOT matched: the sell
// snapshot was captured with a funded LCAP holder as signer (the zapper API
// refuses to construct sells for unfunded signers) and slippage is a UI
// setting the specs leave at its default. The quote's tx calldata is swallowed
// by the mock wallet provider's eth_sendTransaction, so a signer mismatch
// inside the calldata is irrelevant.
//
// This file is wired by the zap specs via mockZapperRoutes(page, ...) AFTER the
// base fixture installed the generic api.reserve.org handler — Playwright gives
// the last-registered route precedence, so these specific patterns win for
// zapper paths while /health etc. keep flowing to helpers/api.ts.

export type ZapDirection = 'buy' | 'sell'

export interface ZapQuoteParams {
  chainId: number
  tokenIn: string
  tokenOut: string
  amountIn: string
  slippage: number
  trade: boolean
}

export interface ZapQuoteResult {
  tokenIn: string
  amountIn: string
  amountInValue: number | null
  tokenOut: string
  amountOut: string
  amountOutValue: number | null
  minAmountOut?: string
  approvalAddress: string
  approvalNeeded: boolean
  insufficientFunds: boolean
  dust: { token: string; amount: string }[]
  dustValue: number | null
  gas: string | null
  priceImpact: number
  truePriceImpact: number
  tx: { data: string; to: string; value: string } | null
}

export interface ZapQuoteResponse {
  status: 'success' | 'error'
  result?: ZapQuoteResult
  error?: string
}

interface ZapSnapshot {
  params: ZapQuoteParams
  data: ZapQuoteResponse
}

// Load a zap quote snapshot (throws if missing — capture before writing specs).
export function loadZapSnapshot(
  dtfAddress: string,
  direction: ZapDirection
): ZapSnapshot {
  const dtf = findDtfByAddress(dtfAddress)
  if (!dtf) throw new Error(`Unknown registry DTF: ${dtfAddress}`)
  const raw = loadSnapshotRaw<ZapQuoteResponse>(
    `${dtf.snapshotDir}/zap-${direction}.json`
  )
  const params = (raw._meta as { params?: ZapQuoteParams }).params
  if (!params) {
    throw new Error(`zap-${direction}.json is missing _meta.params`)
  }
  return { params, data: raw.data }
}

const AGGREGATORS = ['odos', 'velora', 'enso'] as const

// Logger the zap specs hand to mockZapperRoutes: mirrors the base fixture's
// collector — push into the test's `unmockedCalls` (so @smoke teardown fails on
// any hit) AND console.error (so the line shows up in reports/CI output).
export function zapUnmockedLogger(unmockedCalls: string[]): UnmockedLogger {
  return (message, detail) => {
    const line = `[E2E] ${message}${detail ? ' ' + JSON.stringify(detail) : ''}`
    unmockedCalls.push(line)
    console.error(line)
  }
}

function matches(params: ZapQuoteParams, query: URLSearchParams): boolean {
  return (
    query.get('chainId') === String(params.chainId) &&
    (query.get('tokenIn') ?? '').toLowerCase() === params.tokenIn.toLowerCase() &&
    (query.get('tokenOut') ?? '').toLowerCase() === params.tokenOut.toLowerCase() &&
    query.get('amountIn') === params.amountIn
  )
}

// Install the zapper mock for one DTF. `log` should push into the spec's
// `unmockedCalls` fixture array (same contract as helpers/provider.ts) so
// @smoke specs fail loudly on any quote request outside the pinned inputs.
export async function mockZapperRoutes(
  page: Page,
  dtfAddress: string,
  log: UnmockedLogger
) {
  const snapshots = (['buy', 'sell'] as const)
    .filter((direction) => {
      const dtf = findDtfByAddress(dtfAddress)
      return dtf && snapshotExists(`${dtf.snapshotDir}/zap-${direction}.json`)
    })
    .map((direction) => loadZapSnapshot(dtfAddress, direction))

  // Native zap quotes: pinned-input snapshot or fail-loud 500.
  await page.route('**/api.reserve.org/api/zapper/**', (route) => {
    const url = new URL(route.request().url())
    if (!url.pathname.endsWith('/swap')) {
      log('unmocked zap endpoint', { path: url.pathname })
      return route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'error', error: '[E2E] unmocked zap endpoint' }),
      })
    }
    const hit = snapshots.find((s) => matches(s.params, url.searchParams))
    if (hit) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hit.data),
      })
    }
    log('unmocked zap quote', {
      chainId: url.searchParams.get('chainId'),
      tokenIn: url.searchParams.get('tokenIn'),
      tokenOut: url.searchParams.get('tokenOut'),
      amountIn: url.searchParams.get('amountIn'),
    })
    return route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'error', error: '[E2E] unmocked zap quote' }),
    })
  })

  // Aggregator quotes: deterministic provider error (NOT unmocked — this is the
  // designed single-provider setup, see header comment).
  for (const slug of AGGREGATORS) {
    await page.route(`**/api.reserve.org/${slug}/swap**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'error',
          error: `[E2E] ${slug} disabled — native zap is the only mocked provider`,
        }),
      })
    )
  }
}

// ---------------------------------------------------------------------------
// Zap-surface eth_call seeding
//
// helpers/rpc.ts seedChainState answers the basket reads (totalAssets +
// basket-token metadata) for every registry DTF, but the zap widget also reads
// the DTF's OWN erc20 name/symbol directly — chain-state seeds only its
// decimals/version/totalSupply, so those two calls would log unmocked. Seed
// them from the dtf.json snapshot through the per-test overrides layer (which
// wins over the static table, so this stays harmless if rpc.ts grows them).
// ---------------------------------------------------------------------------

const SELECTORS = {
  name: '0x06fdde03',
  symbol: '0x95d89b41',
  balanceOf: '0x70a08231',
  approve: '0x095ea7b3',
} as const

interface DtfSnapshot {
  dtf: { token: { name: string; symbol: string } }
}

export function seedZapSurface(overrides: MockOverrides, dtfAddress: string) {
  const dtf = findDtfByAddress(dtfAddress)
  if (!dtf) throw new Error(`Unknown registry DTF: ${dtfAddress}`)

  const dtfToken = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`).dtf.token
  overrides.ethCall(
    dtfAddress,
    SELECTORS.name,
    encodeAbiParameters([{ type: 'string' }], [dtfToken.name])
  )
  overrides.ethCall(
    dtfAddress,
    SELECTORS.symbol,
    encodeAbiParameters([{ type: 'string' }], [dtfToken.symbol])
  )
}

// Give the test wallet a DTF balance so the SELL direction has funds (the
// static table answers balanceOf with 0). Per-(address, selector) — every
// holder of this DTF reads the same balance, which is fine for a single-wallet
// test world. Also pre-answers the approve() simulation (bool true) so the
// approve TransactionButton's useSimulateContract resolves without an
// unmocked-eth_call log.
export function seedDtfBalance(
  overrides: MockOverrides,
  dtfAddress: string,
  amount: string
) {
  overrides.ethCall(
    dtfAddress,
    SELECTORS.balanceOf,
    encodeAbiParameters([{ type: 'uint256' }], [parseUnits(amount, 18)])
  )
  overrides.ethCall(
    dtfAddress,
    SELECTORS.approve,
    encodeAbiParameters([{ type: 'bool' }], [true])
  )
}
