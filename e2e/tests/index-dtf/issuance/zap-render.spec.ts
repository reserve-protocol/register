import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'
import {
  activeZapPanel,
  mockZapperRoutes,
  seedZapSurface,
  zapFlipButton,
  zapPanel,
  zapUnmockedLogger,
} from '../../../helpers/zapper'

// Issuance zap surface renders offline (widget + buy panel + direction flip)
// on desktop AND mobile — adds the mobile dimension to the zap panel.
// Read-only render; structure contract in helpers/zapper.ts.
test.use({ wallet: false })

const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!

test('issuance zap: widget + buy panel + direction flip render @smoke @mobile', async ({
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
  await expect(zapPanel(widget, 'buy')).toHaveAttribute('data-state', 'active')
  await expect(zapFlipButton(activeZapPanel(widget))).toBeVisible()
})
