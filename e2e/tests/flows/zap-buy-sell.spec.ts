import type { Locator, Page } from '@playwright/test'
import { decodeFunctionData, formatUnits, parseAbi } from 'viem'
import { connectWallet, expect, test } from '../../fixtures/wallet'
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

// Serial + 90s per-test budget: quote round-trips take ~2s isolated but >20s
// under full-suite load on the single dev server (matches zap-edge/failures-zap;
// the 45s quote expects below need headroom inside the test timeout).
test.describe.configure({ mode: 'serial', timeout: 90_000 })

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const APPROVE_ABI = parseAbi(['function approve(address spender, uint256 amount)'])

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
    params: snapshot.params,
    result,
    inputAmount: formatUnits(BigInt(snapshot.params.amountIn), 18),
    // Quote output as rendered in the (read-only) amount-out field — the widget
    // writes the full formatUnits string, so a 6-char prefix is stable.
    outputPrefix: formatUnits(BigInt(result.amountOut), 18).slice(0, 6),
    received: formatReceived(result.amountOut, 18),
    approvalNeeded: result.approvalNeeded,
    // The prepared swap calldata — the mock wallet swallows it, so the txLog
    // must show exactly this to/data (proves the widget submitted the quote).
    tx: result.tx,
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
  txLog,
}) => {
  const buy = pinned('buy')
  await setupZapPage(page, overrides, unmockedCalls)

  const buyPanel = activePanel(page)
  // First paint waits on the SDK's dtf query (subgraph + api + seeded RPC).
  await expect(buyPanel).toBeVisible({ timeout: 15_000 })

  // Confirm the default input token — the pinned quote is ETH -> LCAP.
  await expect(buyPanel.locator('button[aria-haspopup="menu"]')).toContainText('ETH')

  // Enter THE pinned amount (anything else hits the fail-loud 500) and wait
  // for the quote — wipe-resilient, see fillAmountAwaitQuote in helpers/zapper.
  await fillAmountAwaitQuote(buyPanel, buy.inputAmount, buy.outputPrefix)

  // ETH needs no approval — the last button in the panel is the swap submit.
  const submit = buyPanel.locator('button').last()
  await expect(submit).toBeEnabled()
  await submit.click()

  // Mock provider returns a unique hash; receipt polling (real timers) resolves
  // pending -> mining -> success and the success view mounts, linking the tx on
  // the explorer and showing the received LCAP amount.
  const widget = page.getByTestId('issuance-zap-widget')
  const txLink = widget.locator('a[href*="/tx/0x"]')
  await expect(txLink).toBeVisible({ timeout: 15_000 })
  await expect(
    widget.locator('span', { hasText: new RegExp(`^${buy.received.replace('.', '\\.')}$`) })
  ).toBeVisible()

  // Payload assertion: exactly one submitted tx and it is the quote's prepared
  // swap calldata (to + data), and the success link points at its hash.
  expect(txLog).toHaveLength(1)
  expect(txLog[0].chainId).toBe(buy.params.chainId)
  expect(txLog[0].to).toBe(buy.tx!.to.toLowerCase())
  expect(txLog[0].data.toLowerCase()).toBe(buy.tx!.data.toLowerCase())
  expect(BigInt(txLog[0].value)).toBe(BigInt(buy.tx!.value))
  await expect(txLink).toHaveAttribute('href', new RegExp(txLog[0].hash))

  expect(unmockedCalls).toEqual([])
})

test('sell LCAP for ETH: quote -> approve -> submit -> success', async ({
  page,
  overrides,
  unmockedCalls,
  txLog,
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

  await fillAmountAwaitQuote(sellPanel, sell.inputAmount, sell.outputPrefix)

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

  expect(txLog).toHaveLength(1)
  const approval = txLog[0]
  const decodedApproval = decodeFunctionData({
    abi: APPROVE_ABI,
    data: approval.data as `0x${string}`,
  })
  expect(approval.chainId).toBe(sell.params.chainId)
  expect(approval.to).toBe(sell.result.tokenIn.toLowerCase())
  expect(decodedApproval.functionName).toBe('approve')
  expect(decodedApproval.args[0].toLowerCase()).toBe(
    sell.result.approvalAddress.toLowerCase()
  )
  expect(decodedApproval.args[1]).toBe((BigInt(sell.result.amountIn) * 120n) / 100n)
  expect(BigInt(approval.value)).toBe(0n)

  // Step 2 — swap: the same button re-enables armed with the zap calldata once
  // the approval receipt state lands in React.
  await expect(submit).toBeEnabled({ timeout: 15_000 })
  await submit.click()

  const widget = page.getByTestId('issuance-zap-widget')
  const txLink = widget.locator('a[href*="/tx/0x"]')
  await expect(txLink).toBeVisible({ timeout: 15_000 })
  await expect(
    widget.locator('span', { hasText: new RegExp(`^${sell.received.replace('.', '\\.')}$`) })
  ).toBeVisible()

  expect(txLog).toHaveLength(2)
  const swap = txLog[1]
  expect(swap.chainId).toBe(sell.params.chainId)
  expect(swap.to).toBe(sell.tx!.to.toLowerCase())
  expect(swap.data.toLowerCase()).toBe(sell.tx!.data.toLowerCase())
  expect(BigInt(swap.value)).toBe(BigInt(sell.tx!.value))
  await expect(txLink).toHaveAttribute('href', new RegExp(swap.hash))

  expect(unmockedCalls).toEqual([])
})
