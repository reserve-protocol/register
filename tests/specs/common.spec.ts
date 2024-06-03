import base from '../fixtures/base'

const test = base()

test.describe.configure({ mode: 'serial' })

test('Connect wallet', async ({ page }) => {
  await page.goto('/dashboard')

  await test.step(`ASD enter market`, async () => {
    await test.step('should not be checked or disabled', async () => {
      await dashboard.checkCollateralSwitchStatus(symbol, false, false)
    })

    await test.step('should display a tooltip on mouseover', async () => {
      await dashboard.checkCollateralSwitchTooltip(
        symbol,
        'Enable this asset as collateral'
      )
    })

    await test.step('should enter market if the tx is accepted', async () => {
      await dashboard.attemptEnterMarket(symbol)
      await dashboard.waitForTransaction(symbol)
      await dashboard.checkCollateralSwitchStatus(symbol, false, true)
    })
  })
})
