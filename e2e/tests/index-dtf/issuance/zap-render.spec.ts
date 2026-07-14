import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'
import { mockZapperRoutes, seedZapSurface, zapUnmockedLogger } from '../../../helpers/zapper'

// Issuance zap surface renders offline (widget + buy/sell tabs) on desktop AND
// mobile — adds the mobile dimension to the zap panel. Read-only render.
test.use({ wallet: false })

const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!

test('issuance zap: widget + buy/sell tabs render @smoke @mobile', async ({
  harness,
  overrides,
  unmockedCalls,
}) => {
  const page = harness.page
  seedZapSurface(overrides, base.address)
  await mockZapperRoutes(page, base.address, zapUnmockedLogger(unmockedCalls))
  await harness.goto(base, 'issuance')

  const widget = page.getByTestId('issuance-zap-widget')
  await expect(widget).toBeVisible({ timeout: 15_000 })
  await expect(widget.locator('button[role="tab"][id$="-trigger-buy"]')).toBeVisible()
  await expect(widget.locator('button[role="tab"][id$="-trigger-sell"]')).toBeVisible()
})
