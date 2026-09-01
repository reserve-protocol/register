import { expect, test } from '../../fixtures/base'
import { dtfPath, findDtfByAddress } from '../../helpers/registry'
import {
  activeZapPanel,
  mockZapperRoutes,
  seedZapSurface,
  zapFlipButton,
  zapPanel,
  zapUnmockedLogger,
} from '../../helpers/zapper'

// Smoke: the issuance page's zap panel (react-zapper widget) renders for
// base/lcap fully offline — the base fixture fails this test on ANY unmocked
// call. No wallet: without a signer the widget builds no quote endpoint, so a
// green run proves the render path alone stays inside the mock boundary; the
// zapper routes are still installed so a stray quote request 500s loudly
// instead of escaping to the network.
//
// Selectors are structural — see the widget structure contract in
// helpers/zapper.ts (panels keep Radix value-derived ids, the Buy/Sell tab
// triggers are hidden since react-zapper 2.10 and the arrow flips direction).

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

  // Buy panel active by default; the sell side is reachable through the
  // direction arrow (no tab triggers since react-zapper 2.10).
  const buyPanel = activeZapPanel(widget)
  await expect(zapPanel(widget, 'buy')).toHaveAttribute('data-state', 'active')
  await expect(zapFlipButton(buyPanel)).toBeVisible()

  // The buy panel mounts both amount fields (in + out) and the input-token
  // selector (USDC leads the list since 2.10). Without a wallet they render
  // disabled — the smoke only proves the surface mounts; the connected
  // behavior lives in flows/zap-buy-sell.spec.ts.
  await expect(buyPanel.locator('input[inputmode="decimal"]')).toHaveCount(2)
  await expect(
    buyPanel.getByRole('button', { name: 'USDC', exact: true })
  ).toBeVisible()
})
