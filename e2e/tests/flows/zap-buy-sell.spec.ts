import type { Locator, Page } from '@playwright/test'
import { formatUnits } from 'viem'
import { connectWallet, expect, test } from '../../fixtures/wallet'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import {
  loadZapSnapshot,
  mockZapperRoutes,
  seedDtfBalance,
  seedZapSurface,
  zapUnmockedLogger,
  type ZapDirection,
} from '../../helpers/zapper'

// Buy/sell via zap on base/lcap, fully offline. The zapper boundary
// (helpers/zapper.ts) serves ONE captured quote per direction, keyed to the
// pinned inputs below; the quote's tx calldata is swallowed by the mock wallet
// provider and the RPC mock serves a confirmed receipt.
//
// TIME: deliberately NOT frozen. Nothing on the zap surface derives state from
// snapshot timestamps (unlike governance voting windows), and every mock
// answers instantly, so real timers are both safe and simpler: the 500ms quote
// debounce and the widget's 9s quote refetch just run — the refetch re-hits the
// same pinned snapshot deterministically. Freezing would only force a
// clock-pump at every debounce/receipt-poll wait for zero determinism gain.
//
// SELECTORS: the react-zapper package ships zero data-testids and its copy is
// Lingui-translated (en/es/ko/zh), so the specs anchor on locale-independent
// structure: the register-owned `issuance-zap-widget` testid scopes the widget;
// inside it, Radix Tabs render `value`-derived ids ("…-trigger-buy",
// "…-trigger-sell", panels with data-state) and the two amount fields are the
// only inputmode="decimal" inputs — enabled = amount-in, disabled = quote-out.
// Token symbols (ETH/LCAP) are not translated copy, so asserting them is safe.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const MOCK_TX_HASH_PREFIX = '/tx/0xaaaa' // helpers/rpc.ts fixed tx hash

function activePanel(page: Page): Locator {
  return page
    .getByTestId('issuance-zap-widget')
    .locator('div[role="tabpanel"][data-state="active"]')
}

// The widget's success view formats the received amount like its Tf() helper:
// >= 1 -> compact 2dp ("16.46"), < 1 -> 4 significant digits ("0.003033").
// Mirrored here so assertions survive snapshot re-captures.
function formatReceived(rawAmount: string, decimals: number): string {
  const value = Number(formatUnits(BigInt(rawAmount), decimals))
  return value < 1
    ? new Intl.NumberFormat('en-US', {
        maximumSignificantDigits: 4,
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value)
    : new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        notation: 'compact',
        compactDisplay: 'short',
      }).format(value)
}

// Pinned UI input ("0.05" ETH / "1" LCAP) derived from the captured request so
// specs and snapshots can never drift apart.
function pinned(direction: ZapDirection) {
  const snapshot = loadZapSnapshot(DTF_ADDRESS, direction)
  const result = snapshot.data.result
  if (!result) throw new Error(`zap-${direction} snapshot has no result`)
  return {
    inputAmount: formatUnits(BigInt(snapshot.params.amountIn), 18),
    // Quote output as rendered in the (read-only) amount-out field — the widget
    // writes the full formatUnits string, so a 6-char prefix is stable.
    outputPrefix: formatUnits(BigInt(result.amountOut), 18).slice(0, 6),
    received: formatReceived(result.amountOut, 18),
    approvalNeeded: result.approvalNeeded,
  }
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

test('buy LCAP with ETH: quote -> submit -> success', async ({
  page,
  overrides,
  unmockedCalls,
}) => {
  const buy = pinned('buy')
  await setupZapPage(page, overrides, unmockedCalls)

  const buyPanel = activePanel(page)
  // First paint waits on the SDK's dtf query (subgraph + api + seeded RPC).
  await expect(buyPanel).toBeVisible({ timeout: 15_000 })

  // Confirm the default input token — the pinned quote is ETH -> LCAP.
  await expect(buyPanel.locator('button[aria-haspopup="menu"]')).toContainText('ETH')

  // Enter THE pinned amount; anything else hits the fail-loud 500.
  await buyPanel.locator('input[inputmode="decimal"]:not([disabled])').fill(buy.inputAmount)

  // Quote round-trip: 500ms debounce + fetch, then the snapshot's amountOut
  // lands in the read-only output field.
  await expect(buyPanel.locator('input[inputmode="decimal"][disabled]')).toHaveValue(
    new RegExp(`^${buy.outputPrefix.replace('.', '\\.')}`),
    { timeout: 10_000 }
  )

  // ETH needs no approval — the last button in the panel is the swap submit.
  const submit = buyPanel.locator('button').last()
  await expect(submit).toBeEnabled()
  await submit.click()

  // Mock provider returns the fixed hash; receipt polling (real timers)
  // resolves pending -> mining -> success and the success view mounts, linking
  // the tx on the explorer and showing the received LCAP amount.
  const widget = page.getByTestId('issuance-zap-widget')
  const txLink = widget.locator(`a[href*="${MOCK_TX_HASH_PREFIX}"]`)
  await expect(txLink).toBeVisible({ timeout: 15_000 })
  await expect(
    widget.locator('span', { hasText: new RegExp(`^${buy.received.replace('.', '\\.')}$`) })
  ).toBeVisible()

  expect(unmockedCalls).toEqual([])
})

test('sell LCAP for ETH: quote -> approve -> submit -> success', async ({
  page,
  overrides,
  unmockedCalls,
}) => {
  const sell = pinned('sell')
  // The pinned sell quote was captured with approvalNeeded=true (ERC20 in) —
  // this flow exercises the two-step approve -> swap button.
  expect(sell.approvalNeeded).toBe(true)

  // Fund the wallet with LCAP (balanceOf is 0 by default) + pre-answer the
  // approve() simulation.
  seedDtfBalance(overrides, DTF_ADDRESS, '20')
  await setupZapPage(page, overrides, unmockedCalls)

  await page.locator('button[role="tab"][id$="-trigger-sell"]').click()
  const sellPanel = activePanel(page)
  await expect(sellPanel).toBeVisible({ timeout: 15_000 })

  // Sell output token defaults to ETH — matches the pinned LCAP -> ETH quote.
  await expect(sellPanel.locator('button[aria-haspopup="menu"]')).toContainText('ETH')

  await sellPanel.locator('input[inputmode="decimal"]:not([disabled])').fill(sell.inputAmount)

  await expect(sellPanel.locator('input[inputmode="decimal"][disabled]')).toHaveValue(
    new RegExp(`^${sell.outputPrefix.replace('.', '\\.')}`),
    { timeout: 10_000 }
  )

  const submit = sellPanel.locator('button').last()

  // Step 1 — approve: sends the approval tx (mock hash). Wait for the approval
  // receipt poll to answer before touching the button again — the button is
  // one element for both steps, and its disabled (mining) window between them
  // can be too brief to sample reliably; the receipt response is the
  // deterministic "step 1 finished" signal (no tx exists before this click, so
  // the first receipt poll is necessarily the approval's).
  await expect(submit).toBeEnabled()
  const approvalReceipt = page.waitForResponse((response) =>
    (response.request().postData() ?? '').includes('eth_getTransactionReceipt')
  )
  await submit.click()
  await approvalReceipt

  // Step 2 — swap: the same button re-enables armed with the zap calldata once
  // the approval receipt state lands in React.
  await expect(submit).toBeEnabled({ timeout: 15_000 })
  await submit.click()

  const widget = page.getByTestId('issuance-zap-widget')
  const txLink = widget.locator(`a[href*="${MOCK_TX_HASH_PREFIX}"]`)
  await expect(txLink).toBeVisible({ timeout: 15_000 })
  await expect(
    widget.locator('span', { hasText: new RegExp(`^${sell.received.replace('.', '\\.')}$`) })
  ).toBeVisible()

  expect(unmockedCalls).toEqual([])
})
