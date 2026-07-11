import type { Locator, Page } from '@playwright/test'
import { formatUnits } from 'viem'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { dtfPath, findDtfByAddress, TEST_ADDRESS } from '../../helpers/registry'
import {
  fillAmountAwaitQuote,
  loadZapSnapshot,
  mockZapperRoutes,
  seedZapSurface,
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
//     subtree (which mounts only when the quote is affordable);
//   - the quote-error message renders as a `.text-red-500` node inside the
//     widget.
//
// TIME is deliberately NOT frozen (same rationale as zap-buy-sell): every mock
// answers instantly and nothing derives from snapshot timestamps.
//
// KEY MECHANIC (drives every assertion below): the widget does NOT read the
// server quote's `insufficientFunds` flag. It computes `insufficientBalance`
// client-side as (typed amount > connected wallet balance). The RPC mock
// answers eth_getBalance with a flat 100 ETH for every address (per-test
// opt-out: overrides.ethBalance), so any pinned buy amount above the balance
// reads as insufficient regardless of the server flag.

// Run this file's tests serially. The error test drives the widget's perpetual
// quote-retry storm; letting the three zap tests run in parallel on the single
// dev server starves each other's quote round-trips (flaky output/quote waits).
// Serial keeps each test's quote endpoint uncontended within the file.
test.describe.configure({ mode: 'serial', timeout: 90_000 })

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap

// Buy amounts, in ETH, derived from each fixture's pinned amountIn so specs and
// snapshots can never drift. Typing anything else hits the fail-loud 500.
function buyAmount(fixture: ZapFixtureName): string {
  return formatUnits(BigInt(loadZapSnapshot(DTF_ADDRESS, fixture).params.amountIn), 18)
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
  // Sanity: default buy input token is ETH (matches every pinned buy quote).
  await expect(panel.locator('button[aria-haspopup="menu"]')).toContainText('ETH')
  return panel
}

// ---------------------------------------------------------------------------
// (1) HIGH PRICE IMPACT — the acknowledgment gate is MASKED by insufficient
// balance. The captured high-impact quote is 1000 ETH (truePriceImpact ~57.8%,
// well above the widget's 5% warning threshold), but 1000 ETH > the mocked
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

  const panel = await setupZapPage(page, overrides, unmockedCalls)

  // The quote resolves (server returned status:success with an amountOut), so
  // the read-only output field populates — this is NOT a still-fetching state.
  const expectedOut = formatUnits(BigInt(hi.amountOut), 18).slice(0, 6)
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

// The AFFORDABLE high-impact path: fund the test wallet past the 1000 ETH
// quote via the per-test balance override so the live tx-button subtree mounts,
// then prove the >=5% acknowledgment gate actually gates — submit stays blocked
// (txLog empty) until the checkbox is ticked.
test('high price impact: checkbox gate blocks submit until acknowledged', async ({
  page,
  overrides,
  unmockedCalls,
  txLog,
}) => {
  overrides.ethBalance(TEST_ADDRESS, 2_000n * 10n ** 18n)

  const panel = await setupZapPage(page, overrides, unmockedCalls)

  const hi = loadZapSnapshot(DTF_ADDRESS, 'buy-highimpact').data.result!
  const expectedOut = formatUnits(BigInt(hi.amountOut), 18).slice(0, 6)
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
// (2) QUOTE ERROR — the widget surfaces the error, offers no tx, and RECOVERS
// when the user switches to a valid amount (no hang).
// ---------------------------------------------------------------------------
test('quote error: error surfaces, no tx possible, recovers on the happy-path amount', async ({
  page,
  overrides,
  unmockedCalls,
  txLog,
}) => {
  // The error quote retries with backoff and the widget then re-polls on its
  // countdown, so the error message renders on a repeating ~16s cycle (visible
  // for most of it, hidden during each "Loading..." refetch window). Budget for
  // catching a visible window even under full-suite parallel load.
  test.setTimeout(200_000)

  const panel = await setupZapPage(page, overrides, unmockedCalls)

  // The error fixture is pinned to amountIn=1 wei (0.000000000000000001 ETH);
  // the API returns {status:'error'} and the widget's quote query throws.
  // The error message renders as red text inside the widget; it flickers with
  // the refetch cycle. fill + expect retried as one unit: a hydration wipe of
  // the typed amount refills instead of waiting out a dead quote (same
  // rationale as fillAmountAwaitQuote — this path just awaits red text, not an
  // output value).
  await expect(async () => {
    await amountIn(panel).fill(buyAmount('error'))
    await expect(widgetOf(page).locator('.text-red-500').first()).toBeVisible({
      timeout: 15_000,
    })
  }).toPass({ timeout: 75_000 })

  // No quote -> the output field never populates (stays at its "0" default) and
  // nothing was sent. (The submit stays disabled, but `.last()` is unreliable
  // here: the error UI appends its own tooltip/Report buttons after the submit,
  // so an empty output + empty txLog is the robust "no tx possible" proof.)
  await expect(amountOut(panel)).toHaveValue(/^0?$/)
  expect(txLog).toEqual([])

  // RECOVERY: type the happy-path buy amount (0.05 ETH). The widget must not be
  // stuck on the prior error — a fresh valid quote resolves and the trade
  // becomes submittable again.
  const buy = loadZapSnapshot(DTF_ADDRESS, 'buy').data.result!
  const expectedOut = formatUnits(BigInt(buy.amountOut), 18).slice(0, 6)
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
  const expectedOut = formatUnits(BigInt(ins.amountOut), 18).slice(0, 6)
  await fillAmountAwaitQuote(panel, buyAmount('buy-insufficient'), expectedOut)

  // No impact checkbox (impact < 5%), and the submit is disabled purely because
  // 200 ETH > the mocked 100 ETH balance (client-side insufficientBalance).
  await expect(widgetOf(page).locator('button[role="checkbox"]')).toHaveCount(0)
  await expect(panel.locator('button').last()).toBeDisabled()
  expect(txLog).toEqual([])
  expect(unmockedCalls).toEqual([])
})
