import { expect, type Locator, type Page } from '@playwright/test'
import { encodeAbiParameters, encodeFunctionData, erc20Abi, parseUnits } from 'viem'
import type { UnmockedLogger } from './logger'
import type { MockOverrides } from './overrides'
import { findDtfByAddress, TEST_ADDRESS } from './registry'
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

// Every pinned quote fixture the mock can serve. Beyond the two happy paths:
// edge-state characterizations captured live (see _meta.source in each file) —
// 'buy-highimpact' (1000 ETH, ~58% impact, above the widget's 5% warning gate),
// 'buy-insufficient' (200 ETH, ~1% impact, server says insufficientFunds),
// 'error' (1-wei quote the API cannot construct; served with its real 500).
export const ZAP_FIXTURES = [
  'buy',
  'sell',
  'buy-highimpact',
  'buy-insufficient',
  'error',
] as const
export type ZapFixtureName = (typeof ZAP_FIXTURES)[number]

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
  // HTTP status the mock serves this fixture with (error captures keep their
  // real 500 via _meta.httpStatus; quotes default to 200).
  status: number
}

// Load a zap quote snapshot (throws if missing — capture before writing specs).
export function loadZapSnapshot(
  dtfAddress: string,
  fixture: ZapFixtureName
): ZapSnapshot {
  const dtf = findDtfByAddress(dtfAddress)
  if (!dtf) throw new Error(`Unknown registry DTF: ${dtfAddress}`)
  const raw = loadSnapshotRaw<ZapQuoteResponse>(
    `${dtf.snapshotDir}/zap-${fixture}.json`
  )
  const meta = raw._meta as { params?: ZapQuoteParams; httpStatus?: number }
  if (!meta.params) {
    throw new Error(`zap-${fixture}.json is missing _meta.params`)
  }
  return { params: meta.params, data: raw.data, status: meta.httpStatus ?? 200 }
}

// Fill the zap amount-in and wait for the pinned quote to land in the
// read-only output field — as ONE retried unit. The widget's balance hydration
// re-renders the input and can WIPE a value typed too early (the input snaps
// back to "0", no quote ever fires, and the output waits out its full timeout).
// Retrying fill+quote together self-heals: a wiped fill simply refills after
// the wipe. This was the root cause of the historical "zap output stuck at 0"
// flake. Inner 10s per attempt, 90s total — quotes take ~2s isolated but >20s
// under full-suite load.
export async function fillAmountAwaitQuote(
  panel: Locator,
  amount: string,
  outputPrefix: string
): Promise<void> {
  const input = panel.locator('input[inputmode="decimal"]:not([disabled])')
  const output = panel.locator('input[inputmode="decimal"][disabled]')
  const expected = new RegExp(`^${outputPrefix.replace('.', '\\.')}`)
  await expect(async () => {
    await input.fill(amount)
    await expect(output).toHaveValue(expected, { timeout: 10_000 })
  }).toPass({ timeout: 90_000 })
}

const AGGREGATORS = ['odos', 'velora', 'enso'] as const

// Logger the zap specs hand to mockZapperRoutes: mirrors the base fixture's
// collector — push into the test's `unmockedCalls` (so strict teardown fails on
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
// committed specs fail loudly on any quote request outside the pinned inputs.
export async function mockZapperRoutes(
  page: Page,
  dtfAddress: string,
  log: UnmockedLogger
) {
  const snapshots = ZAP_FIXTURES.filter((fixture) => {
    const dtf = findDtfByAddress(dtfAddress)
    return dtf && snapshotExists(`${dtf.snapshotDir}/zap-${fixture}.json`)
  }).map((fixture) => loadZapSnapshot(dtfAddress, fixture))

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
        status: hit.status,
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
  const sell = loadZapSnapshot(dtfAddress, 'sell').data.result
  if (!sell) throw new Error('zap-sell snapshot has no result')
  overrides.ethCall(
    dtfAddress,
    encodeFunctionData({
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [TEST_ADDRESS],
    }),
    encodeAbiParameters([{ type: 'uint256' }], [parseUnits(amount, 18)])
  )
  overrides.ethCall(
    dtfAddress,
    encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [sell.approvalAddress as `0x${string}`, (BigInt(sell.amountIn) * 120n) / 100n],
    }),
    encodeAbiParameters([{ type: 'bool' }], [true])
  )
}
