import { test, expect } from '../../../harness'
import { REGISTRY } from '../../../helpers/registry'
import {
  mockZapperRoutes,
  seedZapSurface,
  zapUnmockedLogger,
} from '../../../helpers/zapper'

// Ondo state-space on the BSC issuance zap: with the US market closed the
// pre-quote heads-up must be up before the user types an amount (the 90%
// price-impact quote reads as a broken product otherwise), and it must stay
// off entirely while the market is open. Read-only render, desktop + mobile.
test.use({ wallet: false })

const bsc = REGISTRY.find((d) => d.chainId === 56)!

const CLOSED = {
  market: {
    isOpen: false,
    session: 'closed',
    nextOpen: '2026-01-05T14:30:00.000Z',
    nextClose: '2026-01-05T21:00:00.000Z',
    timestamp: '2026-01-05T02:00:00.000Z',
  },
  assets: [
    {
      address: '0x1111111111111111111111111111111111111111',
      symbol: 'NVDAon',
      name: 'Ondo NVIDIA',
      sessionLimits: { regular: 250_000 },
      capacityUsd: 250_000,
    },
  ],
}

const promptCard = (variant: string) =>
  `[data-testid="mint-prompt-card"][data-variant="${variant}"]`

test('issuance zap (bsc): closed US market shows the pre-quote pricing heads-up @smoke @mobile', async ({
  harness,
  overrides,
  unmockedCalls,
}) => {
  const page = harness.page
  seedZapSurface(overrides, bsc.address)
  await mockZapperRoutes(page, bsc.address, zapUnmockedLogger(unmockedCalls))
  overrides.api(
    { pathname: '/dtf/ondo', search: { address: bsc.address } },
    CLOSED
  )
  await harness.goto(bsc, 'issuance')

  await expect(page.getByTestId('issuance-zap-widget')).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.locator(promptCard('closed-heads-up')).first()).toBeVisible(
    { timeout: 15_000 }
  )
})

test('issuance zap (bsc): an open US market shows no prompt @smoke @mobile', async ({
  harness,
  overrides,
  unmockedCalls,
  boundaryRequests,
}) => {
  const page = harness.page
  seedZapSurface(overrides, bsc.address)
  await mockZapperRoutes(page, bsc.address, zapUnmockedLogger(unmockedCalls))
  overrides.api(
    { pathname: '/dtf/ondo', search: { address: bsc.address } },
    {
      market: { ...CLOSED.market, isOpen: true, session: 'regular' },
      assets: CLOSED.assets,
    }
  )
  await harness.goto(bsc, 'issuance')

  await expect(page.getByTestId('issuance-zap-widget')).toBeVisible({
    timeout: 15_000,
  })
  // Absence only means something once the market state actually landed.
  await expect
    .poll(
      () =>
        boundaryRequests.filter(
          (request) =>
            request.boundary === 'api' && request.pathname === '/dtf/ondo'
        ).length
    )
    .toBeGreaterThan(0)
  await expect(page.getByTestId('mint-prompt-card')).toHaveCount(0)
})
