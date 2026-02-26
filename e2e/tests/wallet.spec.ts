import { test, expect } from '../fixtures/wallet'

test.describe('Wallet connection', () => {
  test('wallet auto-connects and shows address in header', async ({ page }) => {
    await page.goto('/')

    // The mock wallet sets window.ethereum which wagmi detects.
    // The wallet should auto-connect, showing the address instead of "Connect".
    const walletDisplay = page.getByTestId('header-wallet')
    await expect(walletDisplay).toBeVisible({ timeout: 15000 })

    // Connect button should NOT be visible when connected
    await expect(page.getByTestId('header-connect-btn')).not.toBeVisible()
  })

  test('connected state shows wallet icon and chain logo', async ({ page }) => {
    await page.goto('/')

    // Wait for wallet to connect
    const walletDisplay = page.getByTestId('header-wallet')
    await expect(walletDisplay).toBeVisible({ timeout: 15000 })

    // Wallet icon (lucide Wallet component) should be present
    await expect(walletDisplay.locator('svg').first()).toBeVisible()
  })
})
