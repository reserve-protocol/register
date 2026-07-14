import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import { mockZapperRoutes, seedZapSurface, zapUnmockedLogger } from '../../helpers/zapper'

// Smoke: the issuance page's zap panel (react-zapper widget) renders for
// base/lcap fully offline — the base fixture fails this test on ANY unmocked
// call. No wallet: without a signer the widget builds no quote endpoint, so a
// green run proves the render path alone stays inside the mock boundary; the
// zapper routes are still installed so a stray quote request 500s loudly
// instead of escaping to the network.
//
// Selectors are structural (the widget ships no testids and its copy is
// Lingui-translated): register's `issuance-zap-widget` testid scopes the card,
// Radix Tabs expose value-derived ids, and the amount fields are the only
// inputmode="decimal" inputs. Token symbols are not translated.

const DTF_ADDRESS = '0x4dA9A0f397dB1397902070f93a4D6ddBC0E0E6e8' // base/lcap

test('issuance zap panel renders offline @smoke', async ({
  page,
  overrides,
  unmockedCalls,
}) => {
  seedZapSurface(overrides, DTF_ADDRESS)
  await mockZapperRoutes(page, DTF_ADDRESS, zapUnmockedLogger(unmockedCalls))

  const dtf = findDtfByAddress(DTF_ADDRESS)!
  await page.goto(dtfPath(dtf, 'issuance'))

  const widget = page.getByTestId('issuance-zap-widget')
  // First paint waits on the SDK's dtf query (subgraph + api + seeded RPC).
  await expect(widget).toBeVisible({ timeout: 15_000 })

  // Buy/sell tabs mounted (Radix value-derived ids, locale-independent).
  await expect(widget.locator('button[role="tab"][id$="-trigger-buy"]')).toBeVisible()
  await expect(widget.locator('button[role="tab"][id$="-trigger-sell"]')).toBeVisible()

  // The active (buy) panel mounts both amount fields (in + out) and the ETH
  // input-token selector. Without a wallet they render disabled — the smoke
  // only proves the surface mounts; the connected behavior lives in
  // flows/zap-buy-sell.spec.ts.
  const buyPanel = widget.locator('div[role="tabpanel"][data-state="active"]')
  await expect(buyPanel.locator('input[inputmode="decimal"]')).toHaveCount(2)
  await expect(buyPanel.getByRole('button', { name: 'ETH', exact: true })).toBeVisible()
})
