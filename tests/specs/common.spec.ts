import base from '../fixtures/base'

const test = base()

test.describe.configure({ mode: 'serial' })

test('Common tests', async ({ page }) => {
  await page.goto('/')

  await test.step(`Wallet connected`, async () => {
    const locator = page.getByTestId('account-display-name')
    await expect(locator).toBeVisible()
  })
})
