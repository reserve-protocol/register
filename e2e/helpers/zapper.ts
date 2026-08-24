import { expect, type Locator, type Page } from '@playwright/test'
import {
  encodeAbiParameters,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  parseUnits,
} from 'viem'
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
//   aggregators: /{velora|enso}/swap?chainId&tokenIn&tokenOut&amountIn
//                  &slippage&signer
//
// plus, since react-zapper 2.10, the CoW Swap RFQ venue (enabled on every
// chain) which the widget's cow-sdk client calls DIRECTLY at
// api.cow.fi/<chain>/api/v1/quote — a third egress host, not on api.reserve.org.
//
// In its default "best" mode the widget fires ALL enabled providers in
// parallel and picks the best quote by minAmountOut (ties prefer zap). We mock
// the native zap endpoint from captured snapshots and answer every other
// provider (aggregators + CoW) with a deterministic provider-level error: the
// widget then has exactly one successful candidate, which (a) makes "best"
// mode deterministic and (b) skips the candidate tx-simulation pass (it only
// runs with >= 2 candidates).
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

// The amount-out field as react-zapper renders it (its formatOutputAmount):
// 2 fraction digits from 1 up, 6 below 1, and 4 significant digits when that
// still rounds to 0. Mirrored here so specs can await the exact rendered value
// instead of guessing a raw-formatUnits prefix.
export function formatZapOutput(rawAmount: string, decimals = 18): string {
  const value = Number(formatUnits(BigInt(rawAmount), decimals))
  if (!isFinite(value) || value === 0) return '0'
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value < 1 ? 6 : 2,
    useGrouping: false,
  }).format(value)
  if (Number(formatted) === 0) {
    return new Intl.NumberFormat('en-US', {
      maximumSignificantDigits: 4,
      useGrouping: false,
    }).format(value)
  }
  return formatted
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

// Widget structure contract (react-zapper >= 2.10). The package ships no
// data-testids and its copy is Lingui-translated, so specs anchor on
// locale-independent structure inside register's `issuance-zap-widget`:
//   - the Radix Tabs root still renders value-derived panels
//     ("…-content-buy"/"…-content-sell" with data-state), but the Buy/Sell
//     TRIGGERS are hidden by default (`showTabs` is false) — direction flips
//     through the unlabeled arrow button between the amount boxes (a lucide
//     ArrowUpDown icon), which `sellOnly` removes entirely;
//   - the amount fields are the only inputmode="decimal" inputs (enabled =
//     amount-in, disabled = quote-out);
//   - the token selector is the panel's aria-haspopup="menu" button that
//     isn't the slippage picker ("0.5%"); its menu items are named by symbol.
//     Since 2.10 stables lead every token list, so the first paint defaults
//     to USDC; with a wallet the list re-orders by holdings once balances
//     resolve and the default can flip to ETH a beat later. Specs pinned on
//     ETH quotes must settle the token BEFORE typing an amount, or the USDC
//     quote escapes as an unmocked call.
export function zapPanel(widget: Locator, direction: ZapDirection): Locator {
  return widget.locator(`div[role="tabpanel"][id$="-content-${direction}"]`)
}

export function activeZapPanel(widget: Locator): Locator {
  return widget.locator('div[role="tabpanel"][data-state="active"]')
}

export function zapFlipButton(scope: Locator): Locator {
  return scope.locator('button:has(svg.lucide-arrow-up-down)')
}

// Flip buy <-> sell through the arrow and wait for the target panel to take
// over. The flip resets the selected token to the list default (USDC).
export async function flipZapDirection(
  widget: Locator,
  to: ZapDirection
): Promise<Locator> {
  await zapFlipButton(activeZapPanel(widget)).click()
  const panel = zapPanel(widget, to)
  await expect(panel).toHaveAttribute('data-state', 'active')
  await expect(panel).toBeVisible({ timeout: 15_000 })
  return panel
}

// Settle the panel's token on `symbol` (symbols aren't translated): wait for
// the selector to mount, then pick from the menu unless the widget already
// landed on it (holdings-ordered default).
export async function selectZapToken(
  panel: Locator,
  symbol: string
): Promise<void> {
  const trigger = panel.locator('button[aria-haspopup="menu"]', {
    hasNotText: '%',
  })
  await expect(trigger).toBeVisible({ timeout: 15_000 })
  if (!(await trigger.textContent())?.includes(symbol)) {
    await trigger.click()
    await panel
      .page()
      .getByRole('menuitem', { name: new RegExp(`^${symbol}\\b`) })
      .click()
  }
  await expect(trigger).toContainText(symbol)
}

const AGGREGATORS = ['velora', 'enso'] as const

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
    (query.get('tokenIn') ?? '').toLowerCase() ===
      params.tokenIn.toLowerCase() &&
    (query.get('tokenOut') ?? '').toLowerCase() ===
      params.tokenOut.toLowerCase() &&
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
        body: JSON.stringify({
          status: 'error',
          error: '[E2E] unmocked zap endpoint',
        }),
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
      body: JSON.stringify({
        status: 'error',
        error: '[E2E] unmocked zap quote',
      }),
    })
  })

  // CoW Swap RFQ quotes (direct to api.cow.fi): deterministic 4xx in CoW's
  // error shape so cow-sdk fails the provider once, without its 5xx retries
  // (NOT unmocked — designed single-provider setup, see header comment).
  await page.route('**/api.cow.fi/**', (route) =>
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        errorType: 'UnsupportedToken',
        description:
          '[E2E] cowswap disabled — native zap is the only mocked provider',
      }),
    })
  )

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

  const dtfToken = loadSnapshot<DtfSnapshot>(`${dtf.snapshotDir}/dtf.json`).dtf
    .token
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

  // Since react-zapper 2.10 every quote is re-valued with Reserve prices
  // (/current/prices) and the price-impact math keys off THAT, not the
  // quote's own USD fields. Pin both legs to the prices in force at capture
  // so the mocked $1 lean can't turn a captured impact into a negative one.
  // A price the spec pinned itself (before calling this) stays authoritative.
  const pinned = pinnedZapPrices(dtfAddress)
  if (pinned) {
    for (const [token, price] of [
      [pinned.tokenIn, pinned.tokenInPrice],
      [pinned.tokenOut, pinned.tokenOutPrice],
    ] as const) {
      if (overrides.lookupPrice(pinned.chainId, token) === undefined) {
        overrides.price(pinned.chainId, token, price)
      }
    }
  }
}

// USD prices in force when the DTF's buy quote was captured (USD value /
// amount per leg, both 18-decimal tokens in the current fixtures). undefined
// when the DTF has no zap-buy snapshot or it carries no USD values.
export function pinnedZapPrices(dtfAddress: string):
  | {
      chainId: number
      tokenIn: string
      tokenOut: string
      tokenInPrice: number
      tokenOutPrice: number
    }
  | undefined {
  const dtf = findDtfByAddress(dtfAddress)
  if (!dtf || !snapshotExists(`${dtf.snapshotDir}/zap-buy.json`))
    return undefined
  const { params, data } = loadZapSnapshot(dtfAddress, 'buy')
  const result = data.result
  if (!result?.amountInValue || !result.amountOutValue) return undefined
  const amountIn = Number(formatUnits(BigInt(result.amountIn), 18))
  const amountOut = Number(formatUnits(BigInt(result.amountOut), 18))
  return {
    chainId: params.chainId,
    tokenIn: params.tokenIn,
    tokenOut: params.tokenOut,
    tokenInPrice: result.amountInValue / amountIn,
    tokenOutPrice: result.amountOutValue / amountOut,
  }
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
      args: [
        sell.approvalAddress as `0x${string}`,
        (BigInt(sell.amountIn) * 120n) / 100n,
      ],
    }),
    encodeAbiParameters([{ type: 'bool' }], [true])
  )
}
