import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'
import { mockZapperRoutes, seedZapSurface, zapUnmockedLogger } from '../../../helpers/zapper'

// Compliance state-space + mobile: a geo/VPN-restricted DTF gates the zap trade
// surface — the widget marks itself restricted and the compliance alert shows.
// Adds the mobile dimension to compliance. Read-only render.
test.use({ wallet: false })

const base = REGISTRY.find((d) => d.chainId === 8453 && !d.deprecated)!

test('issuance zap: geo-restricted DTF gates the trade surface @smoke @mobile', async ({
  harness,
  overrides,
  unmockedCalls,
}) => {
  const page = harness.page
  seedZapSurface(overrides, base.address)
  await mockZapperRoutes(page, base.address, zapUnmockedLogger(unmockedCalls))
  overrides.api(
    { pathname: `/v2/compliance/geolocation/dtf/${base.address}` },
    { country: 'Germany', countryCode: 'DE', restricted: true, restriction: 'geolocation-prohibited' }
  )
  await harness.goto(base, 'issuance')

  await expect(page.getByTestId('issuance-zap-widget')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('compliance-alert')).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('[data-testid="issuance-zap-widget"][data-restricted="true"]')).toBeVisible()
})
