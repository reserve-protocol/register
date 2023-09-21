import { test, expect } from '@playwright/test'

test.describe('Issuance > Collateral wrapping', () => {
  test('Open sidebar', async ({ page }) => {
    await page.goto(
      '/#/issuance?token=0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F&chainId=1'
    )
    await page.getByTestId('wrap-btn').click()
  })
})
