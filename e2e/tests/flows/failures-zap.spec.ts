import type { Locator, Page } from '@playwright/test'
import type { Hex } from 'viem'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import type { MockOverrides } from '../../helpers/overrides'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import {
  fillAmountAwaitQuote,
  loadZapSnapshot,
  mockZapperRoutes,
  seedDtfBalance,
  seedZapSurface,
  zapUnmockedLogger,
  type ZapDirection,
} from '../../helpers/zapper'

// FAILURE paths for the zap buy/sell flows on base/lcap. Sibling of
// zap-buy-sell (success). The react-zapper widget gates its SUCCESS view on the
// receipt's own `status` field (receipt.status === 'success'), so unlike
// register's own tx buttons it does NOT mistake a reverted tx for a success —
// these tests lock that correct behavior in. Reject throws before recording
// (txLog stays empty); revert records the send but the receipt is status 0x0.
//
// SELECTORS: the widget ships no data-testids (see zap-buy-sell for the full
// note). Structure only: register's `issuance-zap-widget` scopes it, the active
// Radix tabpanel holds the amount fields, the last button is the submit, and the
// success view is the ONLY place a `/tx/0x…` explorer link appears.

// Serial within the file + a 90s per-test budget: zap quote round-trips take
// ~2s isolated but >20s when the full suite hammers the single dev server
// (same rationale and settings as zap-edge; contention, not a product wait).
test.describe.configure({ mode: 'serial', timeout: 90_000 })

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap

function activePanel(page: Page): Locator {
  return page
    .getByTestId('issuance-zap-widget')
    .locator('div[role="tabpanel"][data-state="active"]')
}

function txLink(page: Page): Locator {
  return page.getByTestId('issuance-zap-widget').locator('a[href*="/tx/0x"]')
}

function pinned(direction: ZapDirection) {
  const snapshot = loadZapSnapshot(DTF_ADDRESS, direction)
  const result = snapshot.data.result
  if (!result) throw new Error(`zap-${direction} snapshot has no result`)
  return {
    params: snapshot.params,
    result,
    inputAmount: (Number(BigInt(snapshot.params.amountIn)) / 1e18).toString(),
    outputPrefix: (Number(BigInt(result.amountOut)) / 1e18).toString().slice(0, 4),
  }
}

// When a submitted swap fails, the widget stays on the panel and (a) keeps a
// live re-simulation of the prepared swap tx running (an eth_call to the zapper
// router with the quote's exact tx.data — for the revert reason) and (b) may
// POST the failure to /zapper/report. The success path never issues these (it
// unmounts the panel for the success view). Neither is in the central mock, so
// seed both per-test — the sanctioned workaround (overrides, not shared edits).
function seedFailureBoundaries(overrides: MockOverrides, direction: ZapDirection) {
  const result = loadZapSnapshot(DTF_ADDRESS, direction).data.result!
  const tx = result.tx!
  overrides.ethCall(tx.to, tx.data as Hex, ('0x' + '0'.repeat(64)) as Hex)
  overrides.api({ method: 'POST', pathname: '/zapper/report' }, { ok: true })
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
}

// Enter the pinned amount and wait for the quote to resolve into the read-only
// output field (wipe-resilient — see fillAmountAwaitQuote in helpers/zapper).
// Returns the submit button (last button in the panel).
async function enterAmountAndQuote(panel: Locator, amount: string, outputPrefix: string) {
  await fillAmountAwaitQuote(panel, amount, outputPrefix)
  return panel.locator('button').last()
}

// ---------------------------------------------------------------------------
// BUY (ETH -> LCAP, no approval)
// ---------------------------------------------------------------------------

test('buy: user rejects the swap — no success view, submit recovers', async ({
  page,
  overrides,
  unmockedCalls,
  txLog,
}) => {
  const buy = pinned('buy')
  await setupZapPage(page, overrides, unmockedCalls)
  const panel = activePanel(page)
  await expect(panel).toBeVisible({ timeout: 15_000 })
  const submit = await enterAmountAndQuote(panel, buy.inputAmount, buy.outputPrefix)
  await expect(submit).toBeEnabled()

  seedFailureBoundaries(overrides, 'buy')
  overrides.transaction({ kind: 'reject' })
  await submit.click()

  // Rejection: nothing recorded and NO success view. The submit control re-arms
  // to an actionable "Buy" (the widget recovered rather than hanging).
  await expect(txLink(page)).toHaveCount(0)
  expect(txLog).toHaveLength(0)
  await expect(submit).toBeEnabled({ timeout: 15_000 })
  await expect(txLink(page)).toHaveCount(0)
  expect(unmockedCalls).toEqual([])
})

test('buy: swap reverts on-chain — widget must not show the success view', async ({
  page,
  overrides,
  unmockedCalls,
  txLog,
}) => {
  const buy = pinned('buy')
  await setupZapPage(page, overrides, unmockedCalls)
  const panel = activePanel(page)
  await expect(panel).toBeVisible({ timeout: 15_000 })
  const submit = await enterAmountAndQuote(panel, buy.inputAmount, buy.outputPrefix)
  await expect(submit).toBeEnabled()

  seedFailureBoundaries(overrides, 'buy')
  overrides.transaction({ kind: 'revert' })
  await submit.click()

  // The send is recorded and reverts...
  await expect.poll(() => txLog.length, { timeout: 15_000 }).toBe(1)
  expect(txLog[0].receiptStatus).toBe('revert')
  expect(txLog[0].to).toBe(buy.result.tx!.to.toLowerCase())

  // ...so the widget must NOT surface the success view, and the submit control
  // must re-arm rather than hang on "confirming".
  await expect(submit).toBeEnabled({ timeout: 15_000 })
  await expect(txLink(page)).toHaveCount(0)
  expect(unmockedCalls).toEqual([])
})

// ---------------------------------------------------------------------------
// SELL (LCAP -> ETH, two-step approve -> swap)
// ---------------------------------------------------------------------------

async function openSellPanel(
  page: Page,
  overrides: Parameters<typeof seedZapSurface>[0],
  unmockedCalls: string[]
) {
  const sell = pinned('sell')
  seedDtfBalance(overrides, DTF_ADDRESS, '20')
  await setupZapPage(page, overrides, unmockedCalls)
  await page.locator('button[role="tab"][id$="-trigger-sell"]').click()
  const panel = activePanel(page)
  await expect(panel).toBeVisible({ timeout: 15_000 })
  const submit = await enterAmountAndQuote(panel, sell.inputAmount, sell.outputPrefix)
  await expect(submit).toBeEnabled()
  seedFailureBoundaries(overrides as MockOverrides, 'sell')
  return { sell, submit }
}

test('sell: user rejects the approval — no success view, submit recovers', async ({
  page,
  overrides,
  unmockedCalls,
  txLog,
}) => {
  const { submit } = await openSellPanel(page, overrides, unmockedCalls)

  overrides.transaction({ kind: 'reject' })
  await submit.click()

  await expect(txLink(page)).toHaveCount(0)
  expect(txLog).toHaveLength(0)
  await expect(submit).toBeEnabled({ timeout: 15_000 })
  await expect(txLink(page)).toHaveCount(0)
  expect(unmockedCalls).toEqual([])
})

test('sell: approval confirms then the swap reverts — no success view', async ({
  page,
  overrides,
  unmockedCalls,
  txLog,
}) => {
  const { sell, submit } = await openSellPanel(page, overrides, unmockedCalls)

  // FIFO: first send (approve) succeeds, second send (swap) reverts on-chain.
  overrides.transaction({ kind: 'success' })
  overrides.transaction({ kind: 'revert' })

  const approvalReceipt = page.waitForResponse((response) =>
    (response.request().postData() ?? '').includes('eth_getTransactionReceipt')
  )
  await submit.click()
  await approvalReceipt
  await expect.poll(() => txLog.length, { timeout: 15_000 }).toBe(1)
  expect(txLog[0].receiptStatus).toBe('success')

  // Step 2 — the swap. Button re-arms once the approval receipt lands.
  await expect(submit).toBeEnabled({ timeout: 15_000 })
  await submit.click()

  await expect.poll(() => txLog.length, { timeout: 15_000 }).toBe(2)
  expect(txLog[1].receiptStatus).toBe('revert')
  expect(txLog[1].to).toBe(sell.result.tx!.to.toLowerCase())

  // Reverted swap must not be surfaced as a success; the submit control recovers.
  await expect(submit).toBeEnabled({ timeout: 15_000 })
  await expect(txLink(page)).toHaveCount(0)
  expect(unmockedCalls).toEqual([])
})
