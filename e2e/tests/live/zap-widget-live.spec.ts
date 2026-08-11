import { connectWallet, expect, test } from '../../fixtures/wallet'
import { LIVE_ENV_VARS, liveConfig } from '../../helpers/live'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import {
  fillAmountAwaitLiveQuote,
  mockZapperRoutes,
  seedZapSurface,
  zapUnmockedLogger,
} from '../../helpers/zapper'

// End-to-end zap through the REAL planner (@live): the same widget flow as
// tests/flows/zap-buy-sell.spec.ts, but the quote is fetched from the live
// deployment instead of a pinned snapshot.
//
//   E2E_LIVE_ZAPPER_API=zrs1 pnpm e2e:live
//
// What this adds over the request-level contract spec: it proves the widget can
// PARSE and USE what the deployment returns — a quote that satisfies the schema
// but, say, renders as an empty output field or produces calldata the widget
// never submits fails here and passes there.
//
// Still mocked, deliberately: RPC/subgraph/wallet. Chain state (balances,
// receipts) stays deterministic and no real transaction is ever broadcast — the
// mock provider swallows the live calldata and hands back a receipt, so the
// assertion is "the widget submitted exactly the live quote's tx".

test.describe.configure({ mode: 'serial', timeout: 180_000 })

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap
const AMOUNT = '0.05' // ETH in; same trade the offline suite pins

const config = liveConfig()

test.describe('@live zap widget against the live planner', () => {
  test.skip(
    !config.zapper,
    `set ${LIVE_ENV_VARS.zapper}=zrs1 to run the live zap flow`
  )

  test('buy LCAP with ETH using a live quote', async ({
    page,
    overrides,
    unmockedCalls,
    txLog,
    live,
    liveViolations,
  }) => {
    // Every live /api/zapper/**/swap response the widget received, in order.
    // The submitted tx must be one of these — the widget refetches every ~9s,
    // so the last-observed quote is not necessarily the one that was armed.
    const quotes: Array<{ to: string; data: string; value: string }> = []
    page.on('response', async (response) => {
      const url = response.url()
      if (!url.includes('/api/zapper/') || !url.includes('/swap')) return
      const body = await response.text().catch(() => '')
      if (!body) return
      const parsed = JSON.parse(body) as {
        result?: { tx?: { to: string; data: string; value: string } | null }
      }
      if (parsed.result?.tx) quotes.push(parsed.result.tx)
    })

    seedZapSurface(overrides, DTF_ADDRESS)
    await mockZapperRoutes(page, DTF_ADDRESS, zapUnmockedLogger(unmockedCalls), {
      live,
      liveViolations,
    })

    const dtf = findDtfByAddress(DTF_ADDRESS)!
    await page.goto(dtfPath(dtf, 'issuance'))
    await connectWallet(page)

    const panel = page
      .getByTestId('issuance-zap-widget')
      .locator('div[role="tabpanel"][data-state="active"]')
    await expect(panel).toBeVisible({ timeout: 30_000 })
    await expect(panel.locator('button[aria-haspopup="menu"]')).toContainText('ETH')

    const quoted = await fillAmountAwaitLiveQuote(panel, AMOUNT)
    expect(Number(quoted), 'live quote output').toBeGreaterThan(0)
    expect(quotes.length, 'live planner returned an executable quote').toBeGreaterThan(0)

    const submit = panel.locator('button').last()
    await expect(submit).toBeEnabled({ timeout: 30_000 })
    await submit.click()

    const widget = page.getByTestId('issuance-zap-widget')
    const txLink = widget.locator('a[href*="/tx/0x"]')
    await expect(txLink).toBeVisible({ timeout: 30_000 })

    // The widget submitted the planner's own calldata, unmodified.
    expect(txLog).toHaveLength(1)
    expect(txLog[0].chainId).toBe(dtf.chainId)
    const submitted = quotes.find(
      (tx) =>
        tx.to.toLowerCase() === txLog[0].to &&
        tx.data.toLowerCase() === txLog[0].data.toLowerCase()
    )
    expect(submitted, 'submitted tx must match a live quote').toBeDefined()
    expect(BigInt(txLog[0].value)).toBe(BigInt(submitted!.value))

    expect(unmockedCalls).toEqual([])
  })
})
