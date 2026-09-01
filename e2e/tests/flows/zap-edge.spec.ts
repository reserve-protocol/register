import type { Locator, Page } from '@playwright/test'
import type { MockOverrides } from '../../helpers/overrides'
import { formatUnits } from 'viem'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { dtfPath, findDtfByAddress, TEST_ADDRESS } from '../../helpers/registry'
import {
  fillAmountAwaitQuote,
  formatZapOutput,
  loadZapSnapshot,
  mockZapperRoutes,
  pinnedZapPrices,
  seedZapSurface,
  selectZapToken,
  zapUnmockedLogger,
  type ZapFixtureName,
} from '../../helpers/zapper'

// Zap EDGE-state characterization on base/lcap, offline. Companion to
// flows/zap-buy-sell.spec.ts (the SUCCESS paths); this file drives the three
// captured edge fixtures — high price impact, quote error, and insufficient
// funds — to pin what the @reserve-protocol/react-zapper widget actually does
// at its guardrails. Selectors follow the same locale-independent structure as
// the buy/sell spec (see its header): the register-owned `issuance-zap-widget`
// testid scopes the widget; the enabled inputmode=decimal input is amount-in,
// the disabled one is the read-only quote-out; the last button is the submit.
//
// The widget ships zero data-testids; the two extra structural anchors this
// spec relies on (verified against the package's dist bundle) are:
//   - the price-impact acknowledgment control is a Radix Checkbox, i.e.
//     `button[role="checkbox"]`, rendered ONLY inside the live tx-button
//     subtree (which mounts only when the quote is affordable). Since
//     react-zapper 2.10 the impact it keys off is dust-adjusted and valued
//     with Reserve prices (/current/prices, pinned to capture-time values by
//     seedZapSurface), and any quote above 8% true impact is discarded as
//     TOXIC before it can reach the gate — so the gate only exists for
//     impacts in [5%, 8%];
//   - a round that ends with NO usable quote (the error fixture) is not an
//     error state since react-zapper 2.10: the query resolves with
//     `selected: null`, the amount-out slot stays in its "Sourcing liquidity"
//     treatment (no read-only output input mounts, no red error text) and
//     the submit stays disabled while the widget retries on its cadence.
//
// TIME is deliberately NOT frozen (same rationale as zap-buy-sell): every mock
// answers instantly and nothing derives from snapshot timestamps.
//
// KEY MECHANIC (drives every assertion below): the widget does NOT read the
// server quote's `insufficientFunds` flag. It computes `insufficientBalance`
// client-side as (typed amount > connected wallet balance). The RPC mock
// answers eth_getBalance with a flat 100 ETH for every address (per-test
// opt-out: overrides.ethBalance), so any pinned buy amount above the balance
// reads as insufficient regardless of the server flag. (Since react-zapper
// 2.10 that same check also skips the pre-select tx simulation — the quote
// itself still resolves.)

// Run this file's tests serially. The error test drives the widget's perpetual
// quote-retry storm; letting the three zap tests run in parallel on the single
// dev server starves each other's quote round-trips (flaky output/quote waits).
// Serial keeps each test's quote endpoint uncontended within the file.
test.describe.configure({ mode: 'serial', timeout: 90_000 })

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap

// Buy amounts, in ETH, derived from each fixture's pinned amountIn so specs and
// snapshots can never drift. Typing anything else hits the fail-loud 500.
function buyAmount(fixture: ZapFixtureName): string {
  return formatUnits(
    BigInt(loadZapSnapshot(DTF_ADDRESS, fixture).params.amountIn),
    18
  )
}

function widgetOf(page: Page): Locator {
  return page.getByTestId('issuance-zap-widget')
}

function activePanel(page: Page): Locator {
  return widgetOf(page).locator('div[role="tabpanel"][data-state="active"]')
}

function amountIn(panel: Locator): Locator {
  return panel.locator('input[inputmode="decimal"]:not([disabled])')
}

function amountOut(panel: Locator): Locator {
  return panel.locator('input[inputmode="decimal"][disabled]')
}

async function setupZapPage(
  page: Page,
  overrides: Parameters<typeof seedZapSurface>[0],
  unmockedCalls: string[]
) {
  seedZapSurface(overrides, DTF_ADDRESS)
  await mockZapperRoutes(page, DTF_ADDRESS, zapUnmockedLogger(unmockedCalls))
  const dtf = findDtfByAddress(DTF_ADDRESS)!
  await page.goto(dtfPath(dtf, 'issuance'))
  await connectWallet(page)
  const panel = activePanel(page)
  await expect(panel).toBeVisible({ timeout: 15_000 })
  // Pick ETH as the buy input (matches every pinned buy quote; the widget
  // defaults to USDC since react-zapper 2.10).
  await selectZapToken(panel, 'ETH')
  return panel
}

// The captured high-impact fixture's own impact (~57.8%) is far past the
// widget's 8% toxic cut-off, which discards the quote before any gate can
// render. The impact the widget uses is computed from Reserve prices, so the
// high-impact tests pin ETH at the price that lands the fixture at ~6.5% true
// impact — inside the acknowledgment gate's [5%, 8%) window — keeping the
// captured quote (and LCAP's capture price) as-is.
function pinHighImpactIntoGateWindow(overrides: MockOverrides) {
  const hi = loadZapSnapshot(DTF_ADDRESS, 'buy-highimpact').data.result!
  const prices = pinnedZapPrices(DTF_ADDRESS)!
  const amountIn = Number(formatUnits(BigInt(hi.amountIn), 18))
  const amountOutValue =
    Number(formatUnits(BigInt(hi.amountOut), 18)) * prices.tokenOutPrice
  // trueImpact = (in - out - dust) / in  =>  in = (out + dust) / (1 - impact)
  const targetImpact = 0.065
  const ethPrice =
    (amountOutValue + (hi.dustValue ?? 0)) / (1 - targetImpact) / amountIn
  overrides.price(prices.chainId, prices.tokenIn, ethPrice)
}

// ---------------------------------------------------------------------------
// (1) HIGH PRICE IMPACT — the acknowledgment gate is MASKED by insufficient
// balance. The pinned high-impact quote is 1000 ETH (impact pinned into the
// gate window, see pinHighImpactIntoGateWindow), but 1000 ETH > the mocked
// 100 ETH wallet balance, so the widget renders the disabled insufficient-
// balance button and never mounts the tx-button subtree that carries the
// price-impact checkbox. Result: the quote resolves, yet NO warning checkbox
// appears and the trade is not submittable. This characterizes the masking at
// the DEFAULT balance; the next test funds the wallet past the quote via
// overrides.ethBalance to reach the gate itself.
// ---------------------------------------------------------------------------
test('high price impact: insufficient-balance masks the warning; no submit, empty txLog', async ({
  page,
  overrides,
  unmockedCalls,
  txLog,
}) => {
  const hi = loadZapSnapshot(DTF_ADDRESS, 'buy-highimpact').data.result!
  expect(hi.truePriceImpact).toBeGreaterThanOrEqual(5) // fixture sanity: above the gate
  pinHighImpactIntoGateWindow(overrides)

  const panel = await setupZapPage(page, overrides, unmockedCalls)

  // The quote resolves (server returned status:success with an amountOut), so
  // the read-only output field populates — this is NOT a still-fetching state.
  const expectedOut = formatZapOutput(hi.amountOut)
  await fillAmountAwaitQuote(panel, buyAmount('buy-highimpact'), expectedOut)

  // Yet the price-impact acknowledgment checkbox never renders: it lives inside
  // the live tx-button subtree, which the client-side insufficient-balance
  // check (1000 ETH > 100 ETH) suppressed in favor of the disabled fallback.
  await expect(widgetOf(page).locator('button[role="checkbox"]')).toHaveCount(0)

  // Not submittable, and nothing was ever sent.
  await expect(panel.locator('button').last()).toBeDisabled()
  expect(txLog).toEqual([])
  expect(unmockedCalls).toEqual([])
})

// ---------------------------------------------------------------------------
// The AFFORDABLE high-impact path: fund the test wallet past the 1000 ETH
// quote via the per-test balance override so the live tx-button subtree mounts,
// then prove the >=5% acknowledgment gate actually gates — submit stays blocked
// (txLog empty) until the checkbox is ticked.
// ---------------------------------------------------------------------------
test('high price impact: checkbox gate blocks submit until acknowledged', async ({
  page,
  overrides,
  unmockedCalls,
  txLog,
}) => {
  overrides.ethBalance(TEST_ADDRESS, 2_000n * 10n ** 18n)
  pinHighImpactIntoGateWindow(overrides)

  const hi = loadZapSnapshot(DTF_ADDRESS, 'buy-highimpact').data.result!
  const panel = await setupZapPage(page, overrides, unmockedCalls)

  const expectedOut = formatZapOutput(hi.amountOut)
  await fillAmountAwaitQuote(panel, buyAmount('buy-highimpact'), expectedOut)

  // Affordable now, so the live tx-button subtree mounts WITH the impact gate.
  const gate = widgetOf(page).locator('button[role="checkbox"]')
  await expect(gate).toBeVisible({ timeout: 45_000 })

  // Unacknowledged -> not submittable, nothing sent.
  const submit = panel.locator('button').last()
  await expect(submit).toBeDisabled()
  expect(txLog).toEqual([])

  // Acknowledge -> the gate releases the submit control.
  await gate.click()
  await expect(gate).toHaveAttribute('data-state', 'checked')
  await expect(submit).toBeEnabled()
  // The gate's job ends at arming the submit; the send itself is the happy-path
  // spec's contract. Nothing has been sent by merely acknowledging.
  expect(txLog).toEqual([])
})

// ---------------------------------------------------------------------------
// (2) QUOTE ERROR — no usable quote: the widget offers no tx (and, since
// react-zapper 2.10, shows no error — it keeps sourcing), and RECOVERS when
// the user switches to a valid amount (no hang).
// ---------------------------------------------------------------------------
test('quote error: no tx possible while sourcing, recovers on the happy-path amount', async ({
  page,
  overrides,
  unmockedCalls,
  txLog,
}) => {
  // The error round retries with backoff and then re-polls on the widget's
  // refresh cadence; budget for the recovery quote under full-suite load.
  test.setTimeout(200_000)

  const panel = await setupZapPage(page, overrides, unmockedCalls)

  // The error fixture is pinned to amountIn=1 wei (0.000000000000000001 ETH);
  // the API returns {status:'error'}, every other provider is mocked to fail,
  // so the round settles with no quote. The widget does NOT surface an error:
  // the amount-out slot never mounts its read-only input and the submit stays
  // disabled. fill + expect retried as one unit: a hydration wipe of the typed
  // amount refills instead of waiting on a dead state.
  await expect(async () => {
    await amountIn(panel).fill(buyAmount('error'))
    await expect(amountIn(panel)).toHaveValue(buyAmount('error'))
    await expect(amountOut(panel)).toHaveCount(0)
    await expect(panel.locator('button').last()).toBeDisabled()
  }).toPass({ timeout: 75_000 })
  await expect(widgetOf(page).locator('.text-red-500')).toHaveCount(0)
  expect(txLog).toEqual([])

  // RECOVERY: type the happy-path buy amount (0.05 ETH). The widget must not be
  // stuck on the prior dead round — a fresh valid quote resolves and the trade
  // becomes submittable again.
  const buy = loadZapSnapshot(DTF_ADDRESS, 'buy').data.result!
  const expectedOut = formatZapOutput(buy.amountOut)
  await fillAmountAwaitQuote(panel, buyAmount('buy'), expectedOut)
  await expect(widgetOf(page).locator('.text-red-500')).toHaveCount(0)
  await expect(panel.locator('button').last()).toBeEnabled({ timeout: 45_000 })

  expect(txLog).toEqual([])
  expect(unmockedCalls).toEqual([])
})

// ---------------------------------------------------------------------------
// (3) INSUFFICIENT FUNDS — which signal drives the UI? The 200 ETH fixture
// carries server insufficientFunds=true AND is unaffordable client-side
// (200 > 100 ETH). The quote resolves (output populates) but the trade is not
// submittable. The driving signal is the CLIENT balance check: the widget
// never reads the server flag (see this file's KEY MECHANIC note), so here the
// two happen to AGREE and the client math is what gates the button.
// ---------------------------------------------------------------------------
test('insufficient funds: quote resolves but client balance math gates the submit', async ({
  page,
  overrides,
  unmockedCalls,
  txLog,
}) => {
  const ins = loadZapSnapshot(DTF_ADDRESS, 'buy-insufficient').data.result!
  expect(ins.insufficientFunds).toBe(true) // server flag set on the fixture
  // Low impact — proves the disabled button below is NOT the impact gate.
  expect(ins.truePriceImpact).toBeLessThan(5)

  const panel = await setupZapPage(page, overrides, unmockedCalls)

  // Quote resolved: the output field shows the server's amountOut.
  const expectedOut = formatZapOutput(ins.amountOut)
  await fillAmountAwaitQuote(panel, buyAmount('buy-insufficient'), expectedOut)

  // No impact checkbox (impact < 5%), and the submit is disabled purely because
  // 200 ETH > the mocked 100 ETH balance (client-side insufficientBalance).
  await expect(widgetOf(page).locator('button[role="checkbox"]')).toHaveCount(0)
  await expect(panel.locator('button').last()).toBeDisabled()
  expect(txLog).toEqual([])
  expect(unmockedCalls).toEqual([])
})
