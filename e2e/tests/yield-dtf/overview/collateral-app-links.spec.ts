import { test, expect } from '../../../harness'
import { YIELD_REGISTRY } from '../../../helpers/registry'
import { setYieldReplay } from '../../../helpers/rpc'
import { yieldPinnedTimestamp } from '../../../helpers/yield'

const eusd = YIELD_REGISTRY.find((dtf) => dtf.symbol === 'eUSD')!

const destinations = [
  [
    '0x8c106EEDAd96553e64287A5A6839c3Cc78afA3D0',
    'https://app.morpho.org/ethereum/vault/0x8c106EEDAd96553e64287A5A6839c3Cc78afA3D0/gauntlet-usdc-prime',
  ],
  [
    '0x9a1D6bd5b8642C41F25e0958129B85f8E1176F3e',
    'https://app.morpho.org/ethereum/vault/0x9a1D6bd5b8642C41F25e0958129B85f8E1176F3e/gauntlet-usdc-frontier',
  ],
  [
    '0xb576765fB15505433aF24FEe2c0325895C559FB2',
    'https://app.morpho.org/ethereum/vault/0xb576765fB15505433aF24FEe2c0325895C559FB2/paypal-usd-main',
  ],
  [
    '0x27F2f159Fe990Ba83D57f39Fd69661764BEbf37a',
    'https://app.compound.xyz/markets/usdc-mainnet',
  ],
  [
    '0x7133EbCb1a23e3d8Be7Ff09362b02b2A2e4c3dA4',
    'https://app.aave.com/reserve-overview/?underlyingAsset=0xdac17f958d2ee523a2206206994597c13d831ec7&marketName=proto_mainnet_v3',
  ],
]

test.use({ wallet: false })

test('eUSD collateral details link to specific protocol markets and keep explorer links @mobile', async ({
  harness,
}, testInfo) => {
  const page = harness.page
  setYieldReplay(eusd.chainId)
  await harness.chain.freezeAt(yieldPinnedTimestamp(eusd))
  await harness.gotoYield(eusd, 'overview')
  for (let i = 0; i < 5; i++) await harness.chain.advance(4_000)

  const rows = page.getByTestId('yield-collateral-row')
  await expect(rows).toHaveCount(destinations.length)

  for (const [address, url] of destinations) {
    const collateral = page.locator(
      `[data-collateral="${address.toLowerCase()}"]`
    )
    await collateral.getByTestId('yield-collateral-toggle').click()
    const appLink = collateral.getByTestId('yield-collateral-app-link')
    await expect(appLink).toHaveAttribute('href', url)
    await expect(appLink).toHaveAttribute('target', '_blank')
    await expect(appLink).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(appLink).toBeVisible()
    await expect(
      collateral.locator(`a[href="https://etherscan.io/token/${address}"]`)
    ).toHaveCount(1)
    const box = await appLink.boundingBox()
    expect(box).not.toBeNull()
    if (testInfo.project.name === 'mobile') {
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
    await collateral.screenshot({ path: testInfo.outputPath(`${address}.png`) })
  }
})

const baseHyusd = YIELD_REGISTRY.find(
  (dtf) => dtf.symbol === 'hyUSD' && dtf.chainId === 8453
)!

test('collaterals without a destination on the current chain keep explorer links without an app link @mobile', async ({
  harness,
}) => {
  const page = harness.page
  setYieldReplay(baseHyusd.chainId)
  await harness.chain.freezeAt(yieldPinnedTimestamp(baseHyusd))
  await harness.gotoYield(baseHyusd, 'overview')
  for (let i = 0; i < 5; i++) await harness.chain.advance(4_000)
  const rows = page.getByTestId('yield-collateral-row')
  await expect(rows.first()).toBeVisible()
  for (const row of await rows.all()) {
    await row.getByTestId('yield-collateral-toggle').click()
    await expect(row.getByTestId('yield-collateral-app-link')).toHaveCount(0)
    await expect(
      row.locator('a[href^="https://basescan.org/token/"]')
    ).toHaveCount(1)
  }
})
